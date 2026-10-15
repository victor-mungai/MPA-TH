const http = require("node:http");

const port = Number.parseInt(process.env.PORT ?? "3000", 10);

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

if (require.main === module) {
  createServer().listen(port, "0.0.0.0", () => {
    console.log(`API listening on port ${port}`);
  });
}

module.exports = { createServer };
