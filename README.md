# FarmConnect

A microservices marketplace connecting farmers, customers, riders, and admins. Spring Boot backend, React frontend, MySQL (one database per service), Kafka, Redis - fully Dockerized, runnable locally with `docker compose up`.

## Architecture

```
                              ┌─────────────────┐
                              │  React Frontend  │  nginx, port 80
                              └────────┬─────────┘
                                       │ /api/**, /uploads/**
                                       ▼
                              ┌─────────────────┐
                              │   API Gateway    │  port 8080
                              │ (Spring Cloud    │  - JWT pre-check
                              │  Gateway)        │  - rate limiting (Redis)
                              └────────┬─────────┘  - circuit breaking
                                       │ lb://service-name
        ┌──────────────┬──────────────┼──────────────┬──────────────┐
        ▼              ▼              ▼              ▼              │
  user-service   product-service  order-service  admin-service      │
   (8081)          (8082)          (8083)          (8084)           │
      │                 │              │  ▲            │            │
      │                 │◄── Kafka ────┘  │        (no DB of its    │
   ┌──▼──┐          ┌───▼───┐          │  │        own - aggregates │
   │user-│          │product│      (resilience4j    live via REST,  │
   │ db  │          │  -db  │       circuit breaker  see below)     │
   └─────┘          └───────┘       + retry, calls                 │
                        ▲            product-service                │
                        │            directly via Eureka)           │
                    ┌───┴───┐                                       │
                    │order- │◄──────────────────────────────────────┘
                    │  db   │
                    └───────┘

  discovery-service (Eureka, 8761) - every service above registers here
  config-server (8888)             - serves shared, non-secret config
```

- **discovery-service** — Eureka registry; every service finds every other service by name, not by hardcoded host:port
- **config-server** — centralized config (CORS origins, resilience4j thresholds, Kafka topic names, logging) served from a bundled native/classpath repo; secrets stay in environment variables, never here
- **api-gateway** — single entry point for all client traffic: routes by service name via Eureka, rate-limits per client IP (Redis-backed), circuit-breaks failing routes to a fallback, and does a fast-fail JWT check before forwarding
- **user-service** — signup/login, JWT issuance, profile management. Owns `user_db`.
- **product-service** — product catalog, image upload, consumes `order-events` from Kafka to decrement stock. Owns `product_db`.
- **order-service** — validates orders against product-service (real price/availability check, resilience4j circuit breaker + retry) before committing, then publishes `order-events` to Kafka. Owns `order_db`.
- **admin-service** — read-only dashboard aggregation. **Owns no database** - every number is fetched live from the other three services over REST (see "Database per service" below).
- **frontend** — React SPA, role-based UI (Customer / Farmer / Rider / Admin), talks only to the gateway

## Database per service

Each business service has its own MySQL instance and schema - `user-db`, `product-db`, `order-db` - each its own container, its own volume, its own credentials scope. No service connects to another service's database. Concretely:

- `products.farmer_id` and `orders.customer_id`/`farmer_id` are **plain columns**, not foreign keys - they reference a `user_id` that lives in a different database entirely. Cross-database foreign keys aren't possible once the data is genuinely split, so ownership is validated at the application layer instead (JWT claims, and order-service's live call to product-service before committing an order).
- `admin-service` used to have its own copies of the `User`/`Product`/`Order` JPA entities pointed at the same shared database. That doesn't work anymore once the databases are actually separate, so admin-service was rewritten to have **no database at all** - `AdminService` calls `user-service`, `product-service`, and `order-service` directly (via Eureka + a load-balanced `RestTemplate`, wrapped in the same resilience4j circuit breaker + retry pattern order-service already used for its product-service call). The admin's own JWT is forwarded on every downstream call, so each service's normal role/ownership checks still apply - admin-service aggregates, it doesn't bypass anything.
- Each service exposes a small admin-only `/stats/counts` endpoint (`GET /api/users/stats/counts`, `/api/products/stats/counts`, `/api/orders/stats/counts`) so the dashboard doesn't have to download every row just to count them.

## Docker images

Every image is a **proper multi-stage build**: a `maven:3.9.5-eclipse-temurin-17` (or `node:22-alpine`) stage compiles/builds, and only the compiled artifact is copied into a minimal `eclipse-temurin:17-jre-alpine` (or `nginx:1.27-alpine`) runtime stage - no build tools, no source code, no Maven cache ends up in the image you actually run. All 7 Spring Boot services share one `.dockerignore` at `farmconnect-backend/` (the real build context for all of them, since Maven's multi-module reactor needs every sibling `pom.xml` present) so `target/` directories and IDE files never bloat the build context. Every image runs as a non-root user and has a `HEALTHCHECK` that compose's `depends_on: condition: service_healthy` relies on for startup ordering.

The three database images (`user-db`, `product-db`, `order-db`) are thin: official `mysql:8.0` plus that one service's schema baked into `/docker-entrypoint-initdb.d/` - credentials are still supplied at container start via environment variables, never baked into the image.

## Why each piece is there

| Concern | How it's addressed |
|---|---|
| Service discovery | Eureka (`discovery-service`) - no hardcoded service hostnames anywhere except the well-known service names |
| Database isolation | One MySQL instance per business service; admin-service has none and aggregates over REST instead |
| Single entry point / routing | Spring Cloud Gateway (`api-gateway`), routes `/api/**` by path to the right service via `lb://service-name` |
| Rate limiting | Gateway's `RequestRateLimiter` filter, Redis-backed, keyed by client IP, different limits per route (auth is the tightest) |
| Circuit breaking + retry | Resilience4j in three places: the gateway's per-route circuit breakers, `order-service` → `product-service`, and `admin-service` → all three business services |
| Centralized config | `config-server`, native/classpath backend - swap to a git backend later without touching any client service |
| Async communication | Kafka (`order-events` topic): order-service publishes, product-service consumes to decrement stock |
| Auth | JWT validated at both the gateway (fast fail) and every individual service (source of truth for role/ownership checks) |
| Testing | JUnit5 + Mockito unit tests per service; one full-stack MockMvc + H2 integration test for the signup/login flow (`user-service`) |

## Running locally

### 1. Configure environment

```bash
cp .env.example .env
```
Edit `.env` and set `MYSQL_ROOT_PASSWORD` and `JWT_SECRET`. Generate a strong JWT secret with:
```bash
openssl rand -hex 32
```

### 2. Build and run everything

```bash
docker compose up --build
```

This builds and starts 13 containers: 3 databases (user-db, product-db, order-db), Redis, Kafka (KRaft, single broker), discovery-service, config-server, api-gateway, the 4 business services, and the frontend. **First boot takes several minutes** - Maven resolves dependencies with no cache, and services wait on `depends_on: condition: service_healthy` chains so things come up in the right order automatically.

| Service | URL | Notes |
|---|---|---|
| Frontend | http://localhost | talks only to the gateway |
| API Gateway | http://localhost:8080 | single entry point for the frontend |
| Eureka dashboard | http://localhost:8761 | see every registered instance |
| Config Server | http://localhost:8888/user-service/default | inspect resolved config per service |
| user-service | http://localhost:8081 | reachable directly too, for debugging |
| product-service | http://localhost:8082 | |
| order-service | http://localhost:8083 | |
| admin-service | http://localhost:8084 | |
| user-db | localhost:3307 | |
| product-db | localhost:3308 | |
| order-db | localhost:3309 | |
| Kafka | localhost:9092 | |

Stop with `docker compose down` (add `-v` to also wipe every database/Kafka volume).

### Running tests

Each service's unit tests run without Docker (pure Mockito):
```bash
cd farmconnect-backend
mvn -pl product-service test
mvn -pl order-service test
mvn -pl user-service test      # includes the MockMvc + H2 integration test
mvn -pl admin-service test
```

### Building/pushing individual images

```bash
docker build -t <dockerhub-user>/farmconnect-user-service:latest -f farmconnect-backend/user-service/Dockerfile farmconnect-backend
docker push <dockerhub-user>/farmconnect-user-service:latest
```
Same pattern for `product-service`, `order-service`, `admin-service`, `discovery-service`, `config-server`, `api-gateway` (all share build context `farmconnect-backend`), plus `database/user-db`, `database/product-db`, `database/order-db`, and `farmconnect-frontend` as their own contexts. `push-to-dockerhub.bat` automates tagging/pushing every image at once.

## CI/CD

`.github/workflows/` has three workflows: `ci.yml` (tests + builds everything on every push/PR), `docker-publish.yml` (pushes every image to **Docker Hub** on a merge to `main`, then commits the new image tags back to `Kubernates/`), and `bootstrap-secrets.yml` (manual-only, creates the one Kubernetes `Secret` that's kept out of GitOps). Setup instructions are in `.github/workflows/README.md`.

Actually deploying to the cluster is **GitOps via ArgoCD**, not a GitHub Actions step - see `argocd/README.md`. ArgoCD watches this repo and syncs `Kubernates/` to the `farmconnect` namespace automatically; the commit `docker-publish.yml` makes is what triggers a deploy, not any `kubectl apply` run by CI.

## Known limitations / next steps

This is tuned for **local docker compose** - no CI/CD pipeline is included right now (the previous Jenkinsfile was removed; add one back, or GitHub Actions, whenever you're ready to automate builds).

- Swap `config-server`'s native/classpath backend for a git-backed one so config changes don't require a rebuild.
- No distributed tracing yet (Zipkin/Jaeger) - useful once you have more than a couple of hops to debug.
- No centralized log aggregation (ELK/Loki) - right now `docker compose logs -f <service>` is how you'd debug.
- Kafka runs as a single broker with no replication - fine for local dev, not for production.
- Each database container currently uses the MySQL root user for simplicity; a real deployment should create a scoped user per service instead.

## Project structure

```
farmconnect/
├── .github/workflows/   # ci.yml, docker-publish.yml, bootstrap-secrets.yml - see workflows/README.md
├── argocd/              # ArgoCD Application (GitOps CD) - see argocd/README.md
├── database/
│   ├── user-db/       # Dockerfile + init.sql - user-service's schema
│   ├── product-db/    # Dockerfile + init.sql - product-service's schema
│   └── order-db/      # Dockerfile + init.sql - order-service's schema
├── farmconnect-backend/
│   ├── pom.xml                 # parent POM + Spring Cloud BOM
│   ├── docker-maven-settings.xml
│   ├── .dockerignore            # shared build-context ignore (all 7 services build from here)
│   ├── discovery-service/      # Eureka
│   ├── config-server/          # centralized config
│   ├── api-gateway/            # Spring Cloud Gateway
│   ├── user-service/
│   ├── product-service/
│   ├── order-service/
│   └── admin-service/          # no database - REST aggregator
├── farmconnect-frontend/
├── docker-compose.yml
├── .env.example
└── push-to-dockerhub.bat
```
