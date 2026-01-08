import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/storead/" : "/",
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
        changeOrigin: false, // 호스트 헤더를 target에 맞게 변경하지 않음 (OAuth 리다이렉트 문제 방지)
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          "vendor-react": ["react", "react-dom", "react-router-dom"],

          // UI component libraries (Radix UI)
          "vendor-ui": [
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slider",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
          ],

          // D3 visualization (큰 라이브러리)
          "vendor-d3": ["d3", "d3-delaunay"],

          // State management & data fetching
          "vendor-query": ["@tanstack/react-query"],

          // Animation
          "vendor-motion": ["framer-motion"],

          // Payment (사용 시에만 로드)
          "vendor-payment": [
            "@tosspayments/payment-widget-sdk",
            "@tosspayments/tosspayments-sdk",
          ],

          // Form & validation
          "vendor-form": ["react-hook-form", "@hookform/resolvers", "zod"],

          // Utilities
          "vendor-utils": [
            "axios",
            "zustand",
            "clsx",
            "tailwind-merge",
            "dompurify",
          ],

          // Other UI utilities
          "vendor-ui-utils": ["lucide-react", "class-variance-authority"],
        },

        // Chunk naming strategy
        chunkFileNames: () => {
          return `assets/js/[name]-[hash].js`;
        },
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },

    // Performance optimizations
    target: "es2015",
    minify: "esbuild",
    cssCodeSplit: true,

    // Chunk size warnings
    chunkSizeWarningLimit: 500,

    // Disable source maps for smaller bundle
    sourcemap: false,

    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
}));
