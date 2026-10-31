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

proxy.conf.json routes /api/categories and /api/dishes to menu-service and /api/orders to order-service. The development proxy is only for ng serve; production routing will be added with deployment work.

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

Each project is its own local Git repository with a main branch. Nothing has been committed or pushed to GitHub. Docker and CI/CD are intentionally deferred.
