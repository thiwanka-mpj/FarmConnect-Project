# Thin, purpose-built image: official MySQL + this one service's schema baked in.
# Credentials are NOT set here - they're supplied at container-start time via
# environment variables (see docker-compose.yml / .env).
FROM mysql:8.0

COPY init.sql /docker-entrypoint-initdb.d/01-schema.sql

EXPOSE 3306
