# CI/CD pipeline

Three workflows now (the old `deploy.yml` is gone - see "Where did deploying go?" below):

| Workflow | Trigger | What it does |
|---|---|---|
| `ci.yml` | every push, every PR into `main` | Tests + builds every backend module, builds + tests the frontend, validates every Dockerfile actually builds, lints every Kubernetes manifest, scans for accidentally-committed secrets. Nothing here touches Docker Hub or AWS - pure fast feedback. |
| `docker-publish.yml` | push to `main`, or a `v*` tag | Builds and pushes all 11 images to **Docker Hub**, tagged both `:latest` and `:<git-sha>`. Then bumps every `Kubernates/*/deployment.yml` to that sha and commits it back to `main` - this commit is what actually triggers a deploy (see below). |
| `bootstrap-secrets.yml` | **manual only** | Creates/updates the one Kubernetes `Secret` that ArgoCD deliberately doesn't manage. Run once before your first ArgoCD sync, and again whenever you rotate `JWT_SECRET`/`MYSQL_ROOT_PASSWORD`. |

## Where did deploying go?

It moved to ArgoCD (GitOps) - see `../argocd/README.md` for the full picture. The short
version: `docker-publish.yml`'s last job commits the new image tags straight to `main`;
ArgoCD (running inside the EKS cluster) watches this repo and syncs that change to the
cluster on its own. No workflow in this repo runs `kubectl apply` against the live
`farmconnect` namespace anymore - `bootstrap-secrets.yml` is the one narrow exception,
and it only ever touches a single `Secret`, not the application itself.

## Why manifest-bumping instead of a deploy step

Keeping "what should be running" entirely in git (rather than in a GitHub Actions run that
happened once and is gone) is the actual point of GitOps: `git log Kubernates/` is a
complete history of every deploy, `git revert` is a rollback, and ArgoCD's own drift
detection means the cluster can never silently diverge from what's committed. The
alternative - a workflow that runs `kubectl apply` directly - works fine too (it's what
this repo did before), but loses that audit trail and makes "what's actually running right
now" a question you can only answer by asking the cluster, not the repo.

## Recommended: branch protection

`docker-publish.yml` trusts that anything on `main` already passed CI - that's only true if
you add a branch protection rule (**Settings → Branches → Add rule** for `main`) requiring
the `CI` check to pass before merging.

## Required GitHub repo configuration

**Variables** (Settings → Secrets and variables → Actions → *Variables* tab):

| Name | Example | Used by |
|---|---|---|
| `AWS_REGION` | `us-east-1` | `bootstrap-secrets.yml` |
| `EKS_CLUSTER_NAME` | `farmconnect-cluster` | `bootstrap-secrets.yml` |

**Secrets** (same page, *Secrets* tab):

| Name | What it is | Used by |
|---|---|---|
| `DOCKERHUB_USERNAME` | Your Docker Hub username | `docker-publish.yml` |
| `DOCKERHUB_TOKEN` | A Docker Hub [access token](https://docs.docker.com/security/for-developers/access-tokens/) (not your password) | `docker-publish.yml` |
| `AWS_ROLE_ARN` | IAM role the workflow assumes via OIDC (see below) | `bootstrap-secrets.yml` |
| `JWT_SECRET` | Same value you'd put in `.env` for docker-compose - generate with `openssl rand -hex 32` | `bootstrap-secrets.yml` |
| `MYSQL_ROOT_PASSWORD` | Same idea - a strong password for the 3 database containers | `bootstrap-secrets.yml` |

Notice `docker-publish.yml` needs **no AWS access at all** now - it only talks to Docker
Hub and to this repo. Only `bootstrap-secrets.yml` needs AWS, and only to create one
Secret, which is why it's the only workflow left using OIDC role assumption. To set that
role up:

1. Create an IAM OIDC identity provider for `token.actions.githubusercontent.com` in your
   AWS account (one-time, per account) - add this to your existing Terraform alongside the
   EKS/VPC resources rather than doing it by hand.
2. Create an IAM role with a trust policy scoped to your repo, e.g.:
   ```json
   {
     "Effect": "Allow",
     "Principal": { "Federated": "arn:aws:iam::<account-id>:oidc-provider/token.actions.githubusercontent.com" },
     "Action": "sts:AssumeRoleWithWebIdentity",
     "Condition": {
       "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
       "StringLike": { "token.actions.githubusercontent.com:sub": "repo:<your-org>/<your-repo>:*" }
     }
   }
   ```
3. Attach `eks:DescribeCluster` permissions, plus whatever your cluster's
   [aws-auth ConfigMap / EKS access entries](https://docs.aws.amazon.com/eks/latest/userguide/grant-k8s-access.html)
   require to let that role run `kubectl` against the cluster.
4. Put that role's ARN in the `AWS_ROLE_ARN` secret.

## Docker Hub images: public or private?

Public repos need nothing extra. If you push to **private** Docker Hub repos, the cluster
needs pull credentials too - see the "Private Docker Hub repos" section in
`../Kubernates/serviceaccount.yml`'s comments.

## Optional: a manual approval gate on secret rotation

`bootstrap-secrets.yml`'s job targets a GitHub *Environment* named `production`. Create one
(**Settings → Environments → New environment → `production`**) and add required reviewers
there if you want a human to explicitly approve each secret rotation.
