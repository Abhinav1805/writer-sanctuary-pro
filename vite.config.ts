import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), viteTsconfigPaths()],
  base: "./",
  build: {
    outDir: "dist/client",
  },
  server: {
    port: 8080,
    strictPort: true,
  },
});