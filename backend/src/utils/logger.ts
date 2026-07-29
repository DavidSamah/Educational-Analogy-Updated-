const LOG_LEVELS = ["debug", "info", "warn", "error", "critical"] as const;
type LogLevel = typeof LOG_LEVELS[number];
let currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

export function setLogLevel(level: LogLevel) { currentLevel = level; }

function log(level: LogLevel, message: string, data?: Record<string, unknown>) {
  const levelIndex = LOG_LEVELS.indexOf(level);
  const currentIndex = LOG_LEVELS.indexOf(currentLevel);
  if (levelIndex < currentIndex) return;
  const entry = { timestamp: new Date().toISOString(), level, message, ...data };
  console.log(JSON.stringify(entry));
}

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => log("debug", message, data),
  info: (message: string, data?: Record<string, unknown>) => log("info", message, data),
  warn: (message: string, data?: Record<string, unknown>) => log("warn", message, data),
  error: (message: string, data?: Record<string, unknown>) => log("error", message, data),
  critical: (message: string, data?: Record<string, unknown>) => log("critical", message, data),
};
