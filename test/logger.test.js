const assert = require("node:assert/strict");
const { test } = require("node:test");
const { Writable } = require("node:stream");

const { createLogger } = require("../src/logger");

function captureOutput() {
  let value = "";
  return {
    output: new Writable({
      write(chunk, _encoding, callback) {
        value += chunk.toString();
        callback();
      },
    }),
    read: () => value,
  };
}

test("logger emits structured JSON", () => {
  const capture = captureOutput();
  const logger = createLogger({ output: capture.output });

  logger.info({ requestId: "request-1" }, "Request completed");

  const entry = JSON.parse(capture.read());
  assert.equal(entry.level, "info");
  assert.equal(entry.message, "Request completed");
  assert.equal(entry.requestId, "request-1");
  assert.match(entry.timestamp, /^\d{4}-\d{2}-\d{2}T/);
});

test("logger serializes errors without enumerable internals", () => {
  const capture = captureOutput();
  const logger = createLogger({ output: capture.output });

  logger.error(new TypeError("failed"), "Operation failed");

  const entry = JSON.parse(capture.read());
  assert.deepEqual(entry.error, { message: "failed", name: "TypeError" });
});

test("logger respects the configured level", () => {
  const capture = captureOutput();
  const logger = createLogger({ level: "error", output: capture.output });

  logger.info({}, "Ignored");

  assert.equal(capture.read(), "");
});
