# FarmConnect on EKS

Kubernetes manifests for the same 13 services that run under `docker-compose.yml`, targeting
the EKS cluster + VPC you already provisioned with Terraform.

> Folder is named `Kubernates` (not `Kubernetes`) to match what was asked for. Rename it if
> that was a typo and not intentional - nothing inside references the folder name itself.

**Deploying these normally isn't a manual `kubectl apply` anymore - see `../argocd/README.md`.**
ArgoCD watches this directory and syncs it automatically once set up. The manual commands
below still work (useful for a first bootstrap, or if you're not using ArgoCD at all), but
the day-to-day flow is: push to `main`, CI builds+pushes images to Docker Hub, a bot commit
bumps the image tags here, ArgoCD notices and deploys it. Nothing to run by hand.

## Layout

```
Kubernates/
├── namespace.yaml         # the "farmconnect" namespace everything lives in
├── serviceaccount.yml     # farmconnect-sa - every pod runs as this, not "default"
├── secrets.yaml           # JWT_SECRET, MYSQL_ROOT_PASSWORD - placeholders, NOT synced by ArgoCD
├── configmap.yaml         # shared non-secret config (Eureka/config-server/Kafka/Redis URLs)
├── complete-deploy.yml    # everything above + every service, concatenated - NOT synced by ArgoCD either (see argocd/application.yaml)
├── discovery-service/     # Eureka
├── config-server/
├── api-gateway/
├── redis/
├── kafka/                 # StatefulSet - needs the EBS CSI driver, see kafka/deployment.yml
├── user-db/                        product-db/                        order-db/
│   StatefulSet + PVC, reuses            "                                  "
│   the same image built for
│   docker-compose (schema baked in)
├── user-service/
├── product-service/       # 1 replica for now - see the note in its deployment.yml
├── order-service/
├── admin-service/         # no database - aggregates over REST, see project README
└── frontend/               # Service (ClusterIP) + Ingress (ALB) - your public entry point
```

Every service folder has exactly `deployment.yml` + `svc.yml`, except:
- `kafka/`, `user-db/`, `product-db/`, `order-db/` - `deployment.yml` contains a `StatefulSet`, not a `Deployment` (they need stable identity + persistent disks), but the filename stays consistent with every other folder.
- `product-service/svc.yml` also contains its uploads `PersistentVolumeClaim`, since it isn't part of a StatefulSet's `volumeClaimTemplate`.
- `frontend/` also has `ingress.yml`.

## Images: Docker Hub

Every `deployment.yml` here references `<DOCKERHUB_USERNAME>/farmconnect-<service>:latest`.
You don't need to manually find/replace this placeholder - the very first successful run of
`.github/workflows/docker-publish.yml` on `main` rewrites it to your real Docker Hub
username and the current commit's image tag, and commits that change back to this
directory. See `.github/workflows/README.md` for the Docker Hub secrets that workflow
needs, and `argocd/README.md` for how that commit turns into an actual deploy.

Building/pushing by hand (e.g. before you've wired up CI, or just to test locally):
```bash
DOCKERHUB_USERNAME=<your-username>
docker login -u $DOCKERHUB_USERNAME

for svc in discovery-service config-server api-gateway user-service product-service order-service admin-service; do
  docker build -t $DOCKERHUB_USERNAME/farmconnect-$svc:latest -f farmconnect-backend/$svc/Dockerfile farmconnect-backend
  docker push $DOCKERHUB_USERNAME/farmconnect-$svc:latest
done

docker build -t $DOCKERHUB_USERNAME/farmconnect-frontend:latest ./farmconnect-frontend
docker push $DOCKERHUB_USERNAME/farmconnect-frontend:latest

for db in user-db product-db order-db; do
  docker build -t $DOCKERHUB_USERNAME/farmconnect-$db:latest ./database/$db
  docker push $DOCKERHUB_USERNAME/farmconnect-$db:latest
done
```
Then replace the placeholder yourself if you're not relying on CI to do it:
```bash
cd Kubernates
grep -rl '<DOCKERHUB_USERNAME>' . | xargs sed -i "s#<DOCKERHUB_USERNAME>#$DOCKERHUB_USERNAME#g"
```

Pushed to **private** repos instead of public ones? See the "Private Docker Hub repos"
section in `serviceaccount.yml`'s comments - pods need pull credentials in that case.

## Cluster prerequisites (regardless of how you deploy)

**1. EBS CSI driver** - `kafka` and the 3 databases all request `PersistentVolumeClaim`s and
will sit in `Pending` forever without it:
```bash
aws eks describe-addon --cluster-name <your-cluster> --addon-name aws-ebs-csi-driver
```
If that comes back empty, add it (via your Terraform, or `aws eks create-addon --cluster-name <your-cluster> --addon-name aws-ebs-csi-driver`) before deploying.

**2. AWS Load Balancer Controller** - `frontend/ingress.yml` provisions an ALB, but only if
this controller is running to watch for `Ingress` objects. Full install command is in
`frontend/ingress.yml`'s comments.

**3. The real secret exists** - run `.github/workflows/bootstrap-secrets.yml` (or the
equivalent manual `kubectl create secret` - see `secrets.yaml`'s comments) before your
first deploy. Nothing will start without it.

## Deploying

**Primary path - ArgoCD (GitOps):** see `../argocd/README.md`. Install ArgoCD once, apply
`argocd/application.yaml` once, and every push to `main` deploys itself from there.

**Manual fallback**, if you want to deploy without ArgoCD at all:
```bash
aws eks update-kubeconfig --name <your-cluster-name> --region <your-region>
kubectl apply -f complete-deploy.yml
```
Or piece by piece, if you'd rather watch each layer come up:
```bash
kubectl apply -f namespace.yaml -f serviceaccount.yml -f configmap.yaml
# (apply the real secret separately - see "Cluster prerequisites" above; don't apply
#  secrets.yaml itself, it's placeholder text)

kubectl apply -f discovery-service/ -f config-server/ -f redis/ -f kafka/
kubectl get pods -n farmconnect -w   # wait for these to go healthy

kubectl apply -f user-db/ -f product-db/ -f order-db/
kubectl get pods -n farmconnect -w

kubectl apply -f user-service/ -f product-service/ -f order-service/ -f admin-service/
kubectl apply -f api-gateway/ -f frontend/
```

Kubernetes doesn't wait for dependencies the way `docker-compose`'s `depends_on: condition: service_healthy` did - a service like `user-service` will crash-loop for a bit if `user-db` or `config-server` isn't ready yet. That's expected; it'll settle once its dependencies are up. Give it a few minutes before troubleshooting.

## Getting the URL

```bash
kubectl get ingress frontend-ingress -n farmconnect
```
The `ADDRESS` column (an ALB hostname - can take a couple of minutes to appear after the AWS Load Balancer Controller picks up the Ingress) is your app's public URL. Update `CORS_ALLOWED_ORIGINS` in `configmap.yaml` to that hostname (or your real domain, once you've pointed one at it), commit it, and let ArgoCD sync the change (or `kubectl apply -f configmap.yaml` + `kubectl rollout restart deployment -n farmconnect --selector=app` if deploying manually).

If the Ingress has no `ADDRESS` after a few minutes, `kubectl describe ingress frontend-ingress -n farmconnect` will show events explaining why (almost always: the AWS Load Balancer Controller isn't installed, or its IAM role/IRSA isn't set up correctly).

## What's different from docker-compose here

- **Database per service, on EBS-backed StatefulSets** instead of docker volumes - same schema-baked-in images, just running on real persistent disks.
- **`admin-service` has no database at all**, same as the docker-compose version - it aggregates live over REST from the other 3 services.
- **`product-service` is pinned to 1 replica** because it still stores uploads on local disk (an EBS volume can only attach to one pod). Migrating to S3 is the natural next step if you need to scale it.
- **Frontend is fronted by an `Ingress` (ALB)**, not a bare `LoadBalancer` Service - the Service itself is `ClusterIP`, and the AWS Load Balancer Controller provisions/manages an Application Load Balancer from `frontend/ingress.yml`.
- **Deploys are GitOps, not a CI step running `kubectl apply`** - see `../argocd/README.md`.
- **Everything else (routing, service discovery, resilience4j, Kafka events) is unchanged** - the app itself doesn't know or care that it's running on EKS instead of docker compose, since every service name resolves the same way (Kubernetes Service DNS names were chosen to match the docker-compose service names exactly).
