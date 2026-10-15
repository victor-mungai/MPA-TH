function parseInteger(name, value, { min, max }) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}`);
  }

  return parsed;
}

function loadConfig(environment = process.env) {
  return Object.freeze({
    database: Object.freeze({
      connectionString: environment.DATABASE_URL || null,
      connectionTimeoutMs: parseInteger(
        "DB_CONNECT_TIMEOUT_MS",
        environment.DB_CONNECT_TIMEOUT_MS || "2000",
        { min: 100, max: 30000 },
      ),
      maxConnections: parseInteger(
        "DB_POOL_MAX",
        environment.DB_POOL_MAX || "10",
        { min: 1, max: 100 },
      ),
    }),
    host: environment.HOST || "0.0.0.0",
    port: parseInteger("PORT", environment.PORT || "3000", {
      min: 1,
      max: 65535,
    }),
    shutdownTimeoutMs: parseInteger(
      "SHUTDOWN_TIMEOUT_MS",
      environment.SHUTDOWN_TIMEOUT_MS || "10000",
      { min: 100, max: 60000 },
    ),
  });
}

module.exports = { loadConfig };
