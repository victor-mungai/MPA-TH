const http = require("node:http");
const { randomUUID } = require("node:crypto");

const { loadConfig } = require("./config");
const { createDatabase } = require("./database");
const { createLogger } = require("./logger");

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

function createServer({ isReady = async () => true, logger = createLogger() } = {}) {
  return http.createServer(async (request, response) => {
    const requestId = randomUUID();
    const startedAt = process.hrtime.bigint();
    const pathname = new URL(request.url, "http://localhost").pathname;
    response.setHeader("x-request-id", requestId);
    response.once("finish", () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
      logger.info(
        {
          durationMs: Number(durationMs.toFixed(2)),
          method: request.method,
          path: pathname,
          requestId,
          statusCode: response.statusCode,
        },
        "Request completed",
      );
    });

    try {
    if (request.method === "GET" && request.url === "/") {
      return sendJson(response, 200, {
        name: "mpa-devops-case-study",
        message: "API is running",
      });
    }

    if (request.method === "GET" && request.url === "/health") {
      return sendJson(response, 200, { status: "ok" });
    }

    if (request.method === "GET" && request.url === "/ready") {
      const ready = await isReady();
      return sendJson(
        response,
        ready ? 200 : 503,
        { status: ready ? "ready" : "unavailable" },
      );
    }

    return sendJson(response, 404, { error: "not_found" });
    } catch (error) {
      logger.error({ error: { message: error.message, name: error.name }, requestId }, "Request failed");
      return sendJson(response, 500, { error: "internal_server_error" });
    }
  });
}

function registerShutdownHandlers(
  server,
  { shutdownTimeoutMs },
  { closeResources = async () => {}, logger = console } = {},
) {
  let shuttingDown = false;

  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info({ signal }, "Shutdown requested");
    server.close(async (error) => {
      if (error) {
        logger.error(error, "HTTP server shutdown failed");
        process.exitCode = 1;
      }

      try {
        await closeResources();
      } catch (closeError) {
        logger.error(closeError, "Resource shutdown failed");
        process.exitCode = 1;
      }
    });

    setTimeout(() => {
      logger.error({}, "Graceful shutdown timed out");
      process.exit(1);
    }, shutdownTimeoutMs).unref();
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

function startServer({ config = loadConfig(), database, logger } = {}) {
  const activeLogger = logger || createLogger({ level: config.logLevel });
  const activeDatabase = database || createDatabase(config.database);
  const server = createServer({
    isReady: activeDatabase.isReady,
    logger: activeLogger,
  });

  server.listen(config.port, config.host, () => {
    activeLogger.info(
      { host: config.host, port: config.port },
      "API listening",
    );
  });
  registerShutdownHandlers(server, config, {
    closeResources: activeDatabase.close,
    logger: activeLogger,
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { createServer, registerShutdownHandlers, startServer };
