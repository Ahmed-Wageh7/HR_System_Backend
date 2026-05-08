const TRAILING_SLASHES_REGEX = /\/+$/;
const REGEX_ESCAPE_REGEX = /[.*+?^${}()|[\]\\]/g;

export const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:4200",
  "http://localhost:5173",
  "https://hr-system-frontend-three.vercel.app",
  "https://hr-system-frontend-*.vercel.app",
];

export const normalizeOrigin = (origin) =>
  typeof origin === "string"
    ? origin.trim().toLowerCase().replace(TRAILING_SLASHES_REGEX, "")
    : "";

export const parseAllowedOrigins = (origins) =>
  String(origins || "")
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

export const buildAllowedOrigins = (origins = []) =>
  Array.from(
    new Set([
      ...DEFAULT_ALLOWED_ORIGINS,
      ...(Array.isArray(origins) ? origins : parseAllowedOrigins(origins)),
    ]),
  );

const wildcardToRegex = (pattern) =>
  new RegExp(
    `^${pattern.replace(REGEX_ESCAPE_REGEX, "\\$&").replace(/\\\*/g, ".*")}$`,
  );

export const isOriginAllowed = (origin, allowedOrigins = []) => {
  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) {
    return true;
  }

  return allowedOrigins.some((allowedOrigin) => {
    const normalizedAllowedOrigin = normalizeOrigin(allowedOrigin);
    if (!normalizedAllowedOrigin) {
      return false;
    }

    if (!normalizedAllowedOrigin.includes("*")) {
      return normalizedAllowedOrigin === normalizedOrigin;
    }

    return wildcardToRegex(normalizedAllowedOrigin).test(normalizedOrigin);
  });
};
