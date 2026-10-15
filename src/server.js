const http = require("node:http");

const { loadConfig } = require("./config");
const { createDatabase } = require("./database");

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

function createServer({ isReady = async () => true } = {}) {
  return http.createServer(async (request, response) => {
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

    logger.info(`${signal} received; shutting down`);
    server.close(async (error) => {
      if (error) {
        logger.error(error);
        process.exitCode = 1;
      }

      try {
        await closeResources();
      } catch (closeError) {
        logger.error(closeError);
        process.exitCode = 1;
      }
    });

    setTimeout(() => {
      logger.error("Graceful shutdown timed out");
      process.exit(1);
    }, shutdownTimeoutMs).unref();
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

function startServer({ config = loadConfig(), database, logger = console } = {}) {
  const activeDatabase = database || createDatabase(config.database);
  const server = createServer({ isReady: activeDatabase.isReady });

  server.listen(config.port, config.host, () => {
    logger.info(`API listening on ${config.host}:${config.port}`);
  });
  registerShutdownHandlers(server, config, {
    closeResources: activeDatabase.close,
    logger,
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { createServer, registerShutdownHandlers, startServer };
