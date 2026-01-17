import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    //this nitro plugin is a workaround to deploy on vercel
    nitro({
      preset: "vercel",
    }),
  ],
  server: {
    port: 3001,
  },

  ssr: {
    external: ["better-auth", "@convex-dev/better-auth"],
  },
});
