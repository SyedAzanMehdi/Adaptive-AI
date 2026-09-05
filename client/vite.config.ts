import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        // Must default correctly: Vite reads the SHELL env, not server/.env, so
        // a var defined only there is undefined here and every /api proxy
        // request fails. Override with BACKEND_URL when the API is elsewhere.
        target: process.env.BACKEND_URL || "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
