import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Static output: `npm run build` writes the site to dist/, which Vercel serves.
export default defineConfig({
  site: "https://askbefore.ai",
  output: "static",
  trailingSlash: "never",
  build: { format: "file" },
  integrations: [sitemap({ filter: (page) => !/\/(privacy|terms|404)$/.test(page) })],
  devToolbar: { enabled: false },
});
