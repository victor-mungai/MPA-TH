const levels = Object.freeze({ error: 0, info: 1, silent: -1 });

function serializeError(error) {
  return {
    message: error instanceof Error ? error.message : String(error),
    name: error instanceof Error ? error.name : "Error",
  };
}

function createLogger({ level = "info", output = process.stdout } = {}) {
  if (!(level in levels)) {
    throw new Error("LOG_LEVEL must be one of: error, info, silent");
  }

  function write(logLevel, context, message) {
    if (levels[level] < levels[logLevel]) return;

    const details = context instanceof Error
      ? { error: serializeError(context) }
      : context;
    output.write(`${JSON.stringify({
      timestamp: new Date().toISOString(),
      level: logLevel,
      message,
      ...details,
    })}\n`);
  }

  return Object.freeze({
    error: (context = {}, message = "Unexpected error") => {
      write("error", context, message);
    },
    info: (context = {}, message = "") => {
      write("info", context, message);
    },
  });
}

module.exports = { createLogger };
