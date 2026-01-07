import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    proxy: {
      // フロントエンドから /.netlify/functions/... にアクセスしたら
      // 自動的にローカルのサーバー機能(9999番ポート)に飛ばす設定
      "/.netlify/functions": "http://localhost:9999",
    },
  },
  plugins: [react()],
});