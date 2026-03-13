import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5288,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:3301",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
