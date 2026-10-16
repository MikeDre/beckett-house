import vinext from "vinext";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { sites } from "./build/sites-vite-plugin";

const { r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

const localBindingConfig = {
  name: "beckett-house-montessori",
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  // Lets worker/index.ts read static files (used to serve responsive image copies).
  assets: { binding: "ASSETS" },
  // Keep the workers.dev address working alongside the live domain.
  workers_dev: true,
  preview_urls: true,
  // The live domain. www is canonical; the worker redirects the bare domain to it.
  routes: [
    { pattern: "www.beckett-house.co.uk", custom_domain: true },
    { pattern: "beckett-house.co.uk", custom_domain: true },
  ],
  // Cloudflare Access application protecting /admin (not secret: the audience tag is public).
  vars: {
    ACCESS_TEAM_DOMAIN: "joinrabble.cloudflareaccess.com",
    ACCESS_AUD: "21c0e2ccd07d35c94a50ffb5f6b51658cffd800bd0c381ccb0897c25ceb1a4b5",
  },
  d1_databases: [{ binding: "DB", database_name: "beckett-house-admin", database_id: "35f9a552-2907-40c7-92a9-68ec0d7f4011", migrations_dir: "migrations" }],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: localBindingConfig,
      }),
    ],
  };
});
