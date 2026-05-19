export function getAppOrigin(request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const configuredOrigin =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL;

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/+$/, "");
  }

  if (forwardedHost) {
    const localHost =
      forwardedHost.startsWith("localhost") ||
      forwardedHost.startsWith("127.0.0.1");
    const proto = forwardedProto || (localHost ? "http" : "https");

    return `${proto}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
}

export function appUrl(request, path) {
  return new URL(path, getAppOrigin(request));
}
