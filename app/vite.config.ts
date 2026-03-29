import { defineConfig } from "vite";

export default defineConfig({
  // base: "./",
  base: '/Breakout_Reborn/', // GitHub Pages에서 사용할 경로
  server: {
    host: true,
    port: 4173,
  },
  build: {
    chunkSizeWarningLimit: 1300,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/phaser")) {
            return "phaser-engine";
          }

          return undefined;
        },
      },
    },
  },
});
