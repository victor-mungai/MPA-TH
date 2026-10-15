const assert = require("node:assert/strict");
const { test } = require("node:test");

const { createDatabase } = require("../../src/database");

const connectionString = process.env.DATABASE_URL;

test(
  "readiness query succeeds against PostgreSQL",
  { skip: !connectionString },
  async () => {
    const database = createDatabase({
      connectionString,
      connectionTimeoutMs: 2000,
      maxConnections: 2,
    });

    try {
      assert.equal(await database.isReady(), true);
    } finally {
      await database.close();
    }
  },
);
