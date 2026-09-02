import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // /api/* 는 ai_set_demo의 로컬 API 서버로 넘긴다.
    // (python -m ai_set_demo.api_server — 기본 8765 포트)
    // 프록시를 쓰면 브라우저가 같은 오리진으로 보므로 CORS 설정이 필요 없다.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8765',
        changeOrigin: true,
      },
    },
  },
})
