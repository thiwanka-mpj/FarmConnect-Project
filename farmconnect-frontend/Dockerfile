# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Install deps first so this layer caches unless package*.json changes
COPY package*.json ./
RUN npm ci

COPY . .

# Baked into the static bundle at build time (CRA env vars must be present at build, not runtime)
ARG REACT_APP_API_BASE_URL=""
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --spider -q http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
