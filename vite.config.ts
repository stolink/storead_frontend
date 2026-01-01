import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5174, // stolink_frontend(5173)와 충돌 방지
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:8081", // storead 백엔드
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
