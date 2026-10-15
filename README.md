# M-PESA Africa DevOps Case Study

This repository contains a small API that will be used to demonstrate containerization, CI/CD, infrastructure as code, and operational practices.

## Current application

The application is a Node.js HTTP service with three endpoints:

- `GET /` returns basic service information.
- `GET /health` returns the service health status.
- `GET /ready` checks whether the database is available to serve traffic.

## Run locally

Requirements:

- Node.js 20 or newer

Start the API:

```bash
npm start
```

The service listens on `0.0.0.0:3000` by default and shuts down gracefully when it receives `SIGINT` or `SIGTERM`.

| Variable | Default | Description |
| --- | --- | --- |
| `HOST` | `0.0.0.0` | Interface on which the server listens |
| `LOG_LEVEL` | `info` | Log level: `info`, `error`, or `silent` |
| `PORT` | `3000` | HTTP port |
| `SHUTDOWN_TIMEOUT_MS` | `10000` | Maximum graceful-shutdown time |
| `DATABASE_URL` | none | PostgreSQL connection URL used by the readiness check |
| `DB_CONNECT_TIMEOUT_MS` | `2000` | Database connection timeout |
| `DB_POOL_MAX` | `10` | Maximum number of database connections |

Without `DATABASE_URL`, the API still starts and its liveness endpoint remains available, but `/ready` returns HTTP `503`.

Requests are logged as JSON and include a generated request ID, response status, and duration. The same request ID is returned in the `x-request-id` response header.

Run the tests:

```bash
npm test
```

Run lint checks and produce a test coverage report:

```bash
npm run lint
npm run test:coverage
```

## Planned work

Containerization, the local multi-service environment, CI/CD, cloud infrastructure, and operational documentation will be added in later phases.
