const assert = require("node:assert/strict");
const { test } = require("node:test");

const { loadConfig } = require("../src/config");

test("configuration uses safe defaults", () => {
  assert.deepEqual(loadConfig({}), {
    host: "0.0.0.0",
    port: 3000,
    shutdownTimeoutMs: 10000,
  });
});

test("configuration accepts supported environment values", () => {
  assert.deepEqual(
    loadConfig({
      HOST: "127.0.0.1",
      PORT: "8080",
      SHUTDOWN_TIMEOUT_MS: "5000",
    }),
    {
      host: "127.0.0.1",
      port: 8080,
      shutdownTimeoutMs: 5000,
    },
  );
});

test("configuration rejects an invalid port", () => {
  assert.throws(() => loadConfig({ PORT: "invalid" }), /PORT must be an integer/);
});
