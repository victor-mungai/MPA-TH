const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

const { createServer } = require("../src/server");

let baseUrl;
let server;

before(async () => {
  server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("GET /health reports a healthy service", async () => {
  const response = await fetch(`${baseUrl}/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("GET /ready reports a ready service", async () => {
  const response = await fetch(`${baseUrl}/ready`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ready" });
});

test("GET /ready reports an unavailable dependency", async () => {
  const unavailableServer = createServer({ isReady: async () => false });
  await new Promise((resolve) => unavailableServer.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${unavailableServer.address().port}`;

  try {
    const response = await fetch(`${url}/ready`);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { status: "unavailable" });
  } finally {
    await new Promise((resolve) => unavailableServer.close(resolve));
  }
});

test("unknown routes return 404", async () => {
  const response = await fetch(`${baseUrl}/missing`);

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "not_found" });
});
