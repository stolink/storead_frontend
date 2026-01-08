import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Chunk 로딩 실패 시 자동 새로고침 (배포 후 구 버전 사용자 대응)
window.addEventListener("error", (event) => {
  const message = event.message || "";

  // 동적 import 실패 감지
  if (
    message.includes("Loading chunk") ||
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("error loading dynamically imported module")
  ) {
    const reloadCount = parseInt(
      sessionStorage.getItem("chunk-reload-count") || "0"
    );

    // 세션당 최대 1번만 새로고침 (무한 새로고침 방지)
    if (reloadCount < 1) {
      sessionStorage.setItem(
        "chunk-reload-count",
        (reloadCount + 1).toString()
      );
      window.location.reload();
    }
    // 1번 새로고침해도 안 되면 에러 메시지만 표시
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
