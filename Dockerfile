# Install dependencies, test, and build Angular.
FROM node:24-alpine AS build
WORKDIR /build
ENV CI=true NG_CLI_ANALYTICS=false

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm test -- --watch=false
RUN npm run build

# Serve the compiled files and forward API requests to the backends.
FROM nginx:stable-alpine AS runtime

ENV MENU_SERVICE_URL=http://host.docker.internal:8081 \
    ORDER_SERVICE_URL=http://host.docker.internal:8082

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /build/dist/restaurant/browser/ /usr/share/nginx/html/

EXPOSE 80
