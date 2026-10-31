# Contexte de build : RACINE du dépôt (workspace pnpm : le back office dépend de packages/ui).
#   docker build -f "plaform-frontend - admin/Dockerfile" .

# Build : compilation du bundle statique (Vite)
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
# Manifestes d'abord : la couche d'installation reste en cache tant qu'ils ne changent pas.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ui/package.json packages/ui/
COPY ["plaform-frontend - admin/package.json", "plaform-frontend - admin/"]
RUN pnpm install --frozen-lockfile --filter gehmit-admin...
ARG VITE_API_URL=https://api.gehmit.org
ARG VITE_KEYCLOAK_URL=https://auth.gehmit.org
ARG VITE_KEYCLOAK_REALM=gehmit
ARG VITE_KEYCLOAK_CLIENT=admin-frontend
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_KEYCLOAK_URL=${VITE_KEYCLOAK_URL} \
    VITE_KEYCLOAK_REALM=${VITE_KEYCLOAK_REALM} \
    VITE_KEYCLOAK_CLIENT=${VITE_KEYCLOAK_CLIENT}
COPY packages/ui packages/ui
COPY ["plaform-frontend - admin", "plaform-frontend - admin/"]
WORKDIR "/app/plaform-frontend - admin"
RUN pnpm exec tsc -b && pnpm exec vite build

# Runtime : nginx sert le bundle
FROM nginx:alpine
COPY ["plaform-frontend - admin/nginx.conf", "/etc/nginx/conf.d/default.conf"]
COPY --from=build ["/app/plaform-frontend - admin/dist", "/usr/share/nginx/html"]
EXPOSE 80
