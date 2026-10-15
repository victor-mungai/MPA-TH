const http = require("node:http");

const { loadConfig } = require("./config");

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

function createServer() {
  return http.createServer((request, response) => {
    if (request.method === "GET" && request.url === "/") {
      return sendJson(response, 200, {
        name: "mpa-devops-case-study",
        message: "API is running",
      });
    }

    if (request.method === "GET" && request.url === "/health") {
      return sendJson(response, 200, { status: "ok" });
    }

    return sendJson(response, 404, { error: "not_found" });
  });
}

function registerShutdownHandlers(server, { shutdownTimeoutMs }, logger = console) {
  let shuttingDown = false;

  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info(`${signal} received; shutting down`);
    server.close((error) => {
      if (error) {
        logger.error(error);
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

function startServer(config = loadConfig(), logger = console) {
  const server = createServer();

  server.listen(config.port, config.host, () => {
    logger.info(`API listening on ${config.host}:${config.port}`);
  });
  registerShutdownHandlers(server, config, logger);

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { createServer, registerShutdownHandlers, startServer };
