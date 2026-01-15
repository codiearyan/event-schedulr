import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    //this nitro plugin is a workaround to deploy on vercel
    nitroV2Plugin(),
  ],
  server: {
    port: 3001,
  },

  ssr: {
    noExternal: ["@convex-dev/better-auth"],
  },
});
