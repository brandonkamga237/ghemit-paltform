# Contexte de build : RACINE du dépôt (workspace pnpm : le site dépend de packages/ui).
#   docker build -f plaform-frontend/Dockerfile .

# Build : compilation du bundle statique (Vite)
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
# Manifestes d'abord : la couche d'installation reste en cache tant qu'ils ne changent pas.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ui/package.json packages/ui/
COPY plaform-frontend/package.json plaform-frontend/
RUN pnpm install --frozen-lockfile --filter gehmit-public...
ARG VITE_API_URL=https://api.gehmit.org
ENV VITE_API_URL=${VITE_API_URL}
COPY packages/ui packages/ui
COPY plaform-frontend plaform-frontend
WORKDIR /app/plaform-frontend
RUN pnpm exec tsc -b && pnpm exec vite build

# Runtime : nginx sert le bundle
FROM nginx:alpine
COPY plaform-frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/plaform-frontend/dist /usr/share/nginx/html
EXPOSE 80
