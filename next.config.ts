import type { NextConfig } from "next";
import { execSync } from "child_process";

const gitSha = (() => {
  try { return execSync("git rev-parse --short HEAD").toString().trim(); }
  catch { return "dev"; }
})();

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require("./package.json") as { version: string };

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_APP_SHA: gitSha,
  },
};

export default nextConfig;
