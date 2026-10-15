# M-PESA Africa DevOps Case Study

This repository contains a small API that will be used to demonstrate containerization, CI/CD, infrastructure as code, and operational practices.

## Current application

The application is a Node.js HTTP service with two endpoints:

- `GET /` returns basic service information.
- `GET /health` returns the service health status.

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
| `PORT` | `3000` | HTTP port |
| `SHUTDOWN_TIMEOUT_MS` | `10000` | Maximum graceful-shutdown time |

Run the tests:

```bash
npm test
```

## Planned work

Containerization, the local multi-service environment, CI/CD, cloud infrastructure, and operational documentation will be added in later phases.
