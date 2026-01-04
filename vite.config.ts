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
    strictPort: true, // 포트가 사용 중일 때 자동으로 변경되지 않도록 설정 (OAuth redirect URI 불일치 방지)
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:8081", // storead 백엔드
        changeOrigin: false, // 호스트 헤더를 원래 요청(localhost:5174) 그대로 유지 -> 백엔드가 리다이렉트 URI를 5174로 생성하도록 유도
        secure: false,
      },
    },
  },
});
