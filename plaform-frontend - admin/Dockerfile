# Build : compilation du bundle statique (Vite)
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
ARG VITE_API_URL=https://api.gehmit.org
ARG VITE_KEYCLOAK_URL=https://auth.gehmit.org
ARG VITE_KEYCLOAK_REALM=gehmit
ARG VITE_KEYCLOAK_CLIENT=admin-frontend
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_KEYCLOAK_URL=${VITE_KEYCLOAK_URL} \
    VITE_KEYCLOAK_REALM=${VITE_KEYCLOAK_REALM} \
    VITE_KEYCLOAK_CLIENT=${VITE_KEYCLOAK_CLIENT}
COPY . .
RUN pnpm exec tsc -b && pnpm exec vite build

# Runtime : nginx sert le bundle
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
