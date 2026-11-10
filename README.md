# Restaurant frontend

Angular 22 standalone app following the original frontend's components/models/services layout, reactive forms, routing, and separate HTML/CSS files.

## Start all three projects

1. Open restaurant-menu-service in IntelliJ; run MenuApplication (port 8081).
2. Open restaurant-order-service in IntelliJ; run OrderApplication (port 8082).
3. Open this folder in VS Code and run:

```powershell
npm.cmd ci
npm.cmd start
```

Open http://localhost:4200.
Create a category, add dishes, then place an order. Orders progress from PLACED to PREPARING to SERVED; cancellation is possible before serving.

proxy.conf.json routes /api/categories and /api/dishes to menu-service and /api/orders to order-service during ng serve. The Docker image uses Nginx for these routes instead.

The backend checks dish availability, calculates totals, and saves names/prices at purchase time. Both backends use separate persistent local H2 databases, so no MySQL installation is required yet.

## Structure

- src/app/components: navbar, home, category list/form, dish list/form, order list/form.
- src/app/models: TypeScript API shapes.
- src/app/services: typed HTTP calls and error messages.
- src/app/app.routes.ts: page routes.

## Verify

```powershell
npm.cmd run build
npm.cmd test -- --watch=false
```

To exercise both running backends and actual OpenFeign communication, run scripts/smoke-test.ps1. It creates temporary records and one cancelled order. The order stays as test history; its menu records are removed.

## Docker

Start Docker Desktop, then build from this directory:

```powershell
docker build -t restaurant-frontend:local .
```

The Node.js stage installs dependencies, runs tests, and builds Angular. The final Nginx image serves only the compiled frontend and forwards API requests to the backend services.

With the backends available on your computer on ports 8081 and 8082:

```powershell
docker run -d --name restaurant-frontend -p 4200:80 restaurant-frontend:local
```

Open http://localhost:4200. Stop ng serve first if it is using port 4200, or use `-p 4300:80` and open http://localhost:4300.
The browser calls /api on the frontend's address; Nginx forwards category/dish calls to menu-service and order calls to order-service. Refreshing Angular pages also works.

By default, the backend addresses use host.docker.internal, which Docker Desktop resolves to your computer. Both backends must be reachable on their published ports. An order-service container also needs its own MENU_SERVICE_URL configured to reach menu-service; the frontend settings do not configure Feign.

For containers on the same Docker network, override the frontend addresses when starting it:

```powershell
docker run -d --name restaurant-frontend --network restaurant -p 4200:80 -e MENU_SERVICE_URL=http://restaurant-menu:8081 -e ORDER_SERVICE_URL=http://restaurant-order:8082 restaurant-frontend:local
```

This second example requires an existing network named restaurant with backend containers named restaurant-menu and restaurant-order attached to it. Backend URLs must not include a trailing slash or path. The official Nginx entrypoint substitutes these environment variables into nginx/default.conf.template when the container starts.

```powershell
docker logs restaurant-frontend
docker stop restaurant-frontend
docker rm restaurant-frontend
```
