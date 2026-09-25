# Build : compilation du bundle statique (Vite)
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
ARG VITE_API_URL=https://api.ghemit.brandonkamga.com
ENV VITE_API_URL=${VITE_API_URL}
COPY . .
RUN pnpm exec tsc -b && pnpm exec vite build

# Runtime : nginx sert le bundle
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
