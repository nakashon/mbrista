export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";
export const APP_SHA    = process.env.NEXT_PUBLIC_APP_SHA ?? "local";
export const VERSION_STRING = `v${APP_VERSION} (${APP_SHA})`;
