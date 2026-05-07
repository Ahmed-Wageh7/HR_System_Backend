const TRAILING_SLASHES_REGEX = /\/+$/;
const REGEX_ESCAPE_REGEX = /[.*+?^${}()|[\]\\]/g;

export const normalizeOrigin = (origin) =>
  typeof origin === "string" ? origin.trim().replace(TRAILING_SLASHES_REGEX, "") : "";

export const parseAllowedOrigins = (origins) =>
  String(origins || "")
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

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
