# FarmConnect on ArgoCD (GitOps)

This replaces the old "GitHub Actions runs `kubectl apply`" deploy step with GitOps:
**this git repo is the source of truth**, ArgoCD (running inside your EKS cluster) watches
it and continuously reconciles the cluster to match. Nothing outside the cluster needs
`kubectl` access to deploy anymore - only to install ArgoCD itself once, and for the one
resource ArgoCD deliberately doesn't manage (see "Secrets" below).

## The loop, end to end

```
git push to main
      │
      ▼
.github/workflows/docker-publish.yml
  - builds & pushes every image to Docker Hub, tagged :<git-sha>
  - bumps every Kubernates/*/deployment.yml to that tag
  - commits that change back to main (using the default GITHUB_TOKEN,
    which - deliberately - does not re-trigger this same workflow)
      │
      ▼
ArgoCD (polls this repo every ~3 min by default, or via a webhook - see below)
  - sees Kubernates/ no longer matches the live cluster state
  - automatically syncs (syncPolicy.automated in application.yaml) since
    every deployment.yml now points at a newer image tag
      │
      ▼
New pods roll out in the farmconnect namespace
```

You never run `kubectl apply` against `Kubernates/` by hand once this is set up - you
change something in git (or let CI bump the image tag), and ArgoCD does the rest.

## 1. Install ArgoCD on your cluster

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Wait for it to come up, then get the initial admin password:
```bash
kubectl -n argocd wait --for=condition=available deployment --all --timeout=300s
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
```

Access the UI (quickest way, for a first look - see "Exposing the UI" below for something
more permanent):
```bash
kubectl -n argocd port-forward svc/argocd-server 8080:443
# https://localhost:8080 - username "admin", the password from above
```

## 2. Point ArgoCD at this repo

Edit `application.yaml` in this folder - replace `repoURL` with your actual repo URL - then:
```bash
kubectl apply -f argocd/application.yaml
```

That's it. Open the ArgoCD UI (or `argocd app get farmconnect`) and you'll see it sync
every manifest under `Kubernates/` (except `complete-deploy.yml` and `secrets.yaml` - see
`application.yaml`'s comments for why) into the `farmconnect` namespace.

**If your Docker Hub repos are private**, images will fail to pull until you also follow
the imagePullSecrets steps in `Kubernates/serviceaccount.yml`'s comments.

**If the EBS CSI driver isn't installed**, the 3 databases and Kafka will sit in `Pending` -
same prerequisite as before, see `Kubernates/README.md`.

**If the AWS Load Balancer Controller isn't installed**, the frontend `Ingress` will sync
fine but never get an `ADDRESS` - same prerequisite as before, see `Kubernates/frontend/ingress.yml`'s comments.

## Secrets

`Kubernates/secrets.yaml` only ever contains placeholder text in this repo, on purpose -
ArgoCD is explicitly told to ignore that file (`application.yaml`'s `directory.exclude`),
so it can never overwrite a real secret with `REPLACE_WITH_...` text. The real
`farmconnect-secrets` Kubernetes Secret is created by a separate, manually-triggered
workflow instead:

```
.github/workflows/bootstrap-secrets.yml  (Actions tab -> Run workflow)
```

Run that once before your first ArgoCD sync (the app's pods won't start without
`JWT_SECRET`/`MYSQL_ROOT_PASSWORD` existing), and again any time you rotate either value.

For something more sophisticated than "a workflow you remember to re-run when secrets
change" - look at the [ArgoCD Vault Plugin](https://argocd-vault-plugin.readthedocs.io/)
or [External Secrets Operator](https://external-secrets.io/) pulling from AWS Secrets
Manager. Out of scope for this pass, but the natural next step.

## Exposing the ArgoCD UI properly

Port-forwarding is fine for a first look, not for daily use. Once the AWS Load Balancer
Controller is installed (you need it for the frontend Ingress anyway), you can front
`argocd-server` the same way - it's a Service in the `argocd` namespace, so an Ingress
for it looks just like `Kubernates/frontend/ingress.yml` but pointed at `argocd-server:80`
in the `argocd` namespace instead. Put it behind auth (ArgoCD has its own login, but
consider also restricting the Ingress to a VPN/known IP range via
`alb.ingress.kubernetes.io/inbound-cidrs`) before exposing it publicly.

## Manual sync / rollback

Automated sync (`syncPolicy.automated` in `application.yaml`) means ArgoCD applies changes
the moment it sees them in git, and self-heals any manual `kubectl edit`. If you'd rather
review each change before it applies, delete the `automated:` block and sync manually:
```bash
argocd app sync farmconnect
```
To roll back, revert the commit in git (that's the actual rollback - `argocd app rollback`
also exists but fights against "git is the source of truth"; a `git revert` + push keeps
history honest) and let ArgoCD sync the reverted state.

## CLI reference

```bash
argocd app get farmconnect        # current sync/health status
argocd app diff farmconnect       # what would change on next sync
argocd app sync farmconnect       # force a sync right now
argocd app history farmconnect    # every sync that's happened
```
