# M-PESA Africa DevOps Case Study

This repository contains a small API that will be used to demonstrate containerization, CI/CD, infrastructure as code, and operational practices.

## Current application

The application is a Node.js HTTP service with three endpoints:

- `GET /` returns basic service information.
- `GET /health` returns the service health status.
- `GET /ready` checks whether the database is available to serve traffic.

## Run locally

Requirements:

- Node.js 24 or newer

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

## Build the application image

Build the production image:

```bash
docker build --target runtime -t mpa-devops-case-study:local .
```

The Dockerfile also provides a `test` target that runs linting and tests during the build:

```bash
docker build --target test .
```

## Run the complete local environment

The local environment includes Nginx, the API, and PostgreSQL. Copy the example configuration and replace the placeholder database password:

```bash
cp .env.example .env
```

On PowerShell, use `Copy-Item .env.example .env` instead.

Start the environment:

```bash
docker compose up --build
```

The API is available through Nginx at `http://localhost:8080`. The application and database ports are not published to the host.

The application and proxy run with read-only filesystems, dropped Linux capabilities, bounded resources, and rotated container logs. PostgreSQL data is stored in the named `postgres-data` volume.

Check the endpoints:

```bash
curl http://localhost:8080/health
curl http://localhost:8080/ready
```

Stop the environment:

```bash
docker compose down
```

Add `--volumes` only when you intentionally want to delete the local PostgreSQL data volume.

## Pull request checks

Pull requests to `main` run automated validation in GitHub Actions. The workflow:

1. Installs dependencies from the committed lockfile.
2. Runs linting, test coverage, and a dependency audit against a real PostgreSQL service.
3. Builds both the test and production container targets.
4. Scans the repository and runtime image for high or critical vulnerabilities, exposed secrets, and unsafe configuration.
5. Runs CodeQL static analysis for JavaScript.

The workflow uses read-only repository access by default, pins actions to immutable commit SHAs, does not expose deployment credentials, and cancels superseded runs.

Merges to `main` also run the image publishing workflow. After validation and vulnerability scanning, it uses GitHub OIDC to obtain short-lived AWS credentials and pushes a commit-SHA-tagged image to Amazon ECR. See [image publishing configuration](docs/image-publishing.md) for the required repository variables and least-privilege IAM permissions.

## Planned work

Containerization, the local multi-service environment, CI/CD, cloud infrastructure, and operational documentation will be added in later phases.
