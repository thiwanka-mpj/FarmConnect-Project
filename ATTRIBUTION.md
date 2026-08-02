# Attribution

This repository combines two clearly separated bodies of work:

## Application code (Univeristy coursework baseline)

- `farmconnect-frontend/`
- `farmconnect-backend/`
- `database/` (schema and seed data only - `init.sql` files)

This is the FarmConnect application as provided/built for a Univeristy project. It is
imported in a single commit (see git log: *"Import baseline FarmConnect application"*)
and is not claimed as original DevOps work.


## DevOps work (My Contribution)

Everything else in this repository:

| Area | Path |
|---|---|
| Containerization | `*/Dockerfile`, `*/.dockerignore` |
| Local orchestration | `docker-compose.yml`, `.env.example` |
| Cloud infrastructure | `Terraform/` |
| Kubernetes manifests | `Kubernates/` |
| CI/CD pipelines | `.github/workflows/` |
| GitOps deployment | `argocd/` |

Each of these was designed, written, and integrated independently as a DevOps/platform
engineering exercise on top of the application above.
