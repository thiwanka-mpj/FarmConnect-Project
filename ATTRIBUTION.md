# Attribution

This repository combines two clearly separated bodies of work:

## Application code (Univeristy coursework baseline)

- `farmconnect-frontend/`
- `farmconnect-backend/`
- `database/` (schema and seed data only - `init.sql` files)

This is the FarmConnect application as provided/built for a Univeristy project. It is
imported in a single commit (see git log: *"Import baseline FarmConnect application"*)
and then I implemented original DevOps practices for this project.


## Implemented DevOps Practices Here

Everything else in this repository:

| Area | Path |
|---|---|
| Containerization | `*/Dockerfile`, `*/.dockerignore` |
| Local orchestration | `docker-compose.yml`, `.env.example` |
| Cloud infrastructure | `Terraform/` |
| Kubernetes manifests | `Kubernetes/` |
| CI/CD pipelines | `.github/workflows/` |
| GitOps deployment | `argocd/` |

Each of these was designed, written, and integrated independently as a DevOps/platform
engineering exercise on top of the application above.
