function firstHeaderValue(value) {
  return value?.split(",")[0]?.trim() || "";
}

function isLocalHost(host) {
  return host.startsWith("localhost") || host.startsWith("127.0.0.1");
}

function originFromHost(host, proto) {
  if (!host) return null;

  const normalizedHost = firstHeaderValue(host);
  const normalizedProto =
    firstHeaderValue(proto) || (isLocalHost(normalizedHost) ? "http" : "https");

  return `${normalizedProto}://${normalizedHost}`;
}

function isLocalOrigin(origin) {
  try {
    return isLocalHost(new URL(origin).host);
  } catch {
    return false;
  }
}

export function getAppOrigin(request) {
  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const host = request.headers.get("host");
  const configuredOrigin =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL;

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    return "https://cruisestack.ai";
  }

  const origins = [
    originFromHost(forwardedHost, forwardedProto),
    originFromHost(host, forwardedProto || requestUrl.protocol.replace(":", "")),
    requestUrl.origin,
  ].filter(Boolean);

  const publicOrigin = origins.find((origin) => !isLocalOrigin(origin));

  return publicOrigin || origins[0] || requestUrl.origin;
}

export function appUrl(request, path) {
  return new URL(path, getAppOrigin(request));
}
