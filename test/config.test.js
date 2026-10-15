const assert = require("node:assert/strict");
const { test } = require("node:test");

const { loadConfig } = require("../src/config");

test("configuration uses safe defaults", () => {
  assert.deepEqual(loadConfig({}), {
    database: {
      connectionString: null,
      connectionTimeoutMs: 2000,
      maxConnections: 10,
    },
    host: "0.0.0.0",
    logLevel: "info",
    port: 3000,
    shutdownTimeoutMs: 10000,
  });
});

test("configuration accepts supported environment values", () => {
  assert.deepEqual(
    loadConfig({
      HOST: "127.0.0.1",
      LOG_LEVEL: "error",
      PORT: "8080",
      SHUTDOWN_TIMEOUT_MS: "5000",
      DATABASE_URL: "postgresql://app:secret@localhost/app",
      DB_CONNECT_TIMEOUT_MS: "1000",
      DB_POOL_MAX: "20",
    }),
    {
      database: {
        connectionString: "postgresql://app:secret@localhost/app",
        connectionTimeoutMs: 1000,
        maxConnections: 20,
      },
      host: "127.0.0.1",
      logLevel: "error",
      port: 8080,
      shutdownTimeoutMs: 5000,
    },
  );
});

test("configuration rejects an invalid port", () => {
  assert.throws(() => loadConfig({ PORT: "invalid" }), /PORT must be an integer/);
});
