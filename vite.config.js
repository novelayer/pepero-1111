import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages(하위 경로)에서도 동작하도록 상대 경로로 빌드한다.
// SITE_URL은 카카오톡 미리보기 이미지(og:image)의 절대 주소에 쓰인다.
// GitHub Actions가 https://<아이디>.github.io/<저장소>/ 로 자동 채운다.
const SITE_URL = (process.env.SITE_URL || 'https://example.github.io/pepero-1111/').replace(/\/?$/, '/');

export default defineConfig({
  base: './',
  plugins: [
    react(),
    { name: 'site-url', transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', SITE_URL) },
  ],
  // 배포(GitHub Pages)에서는 폰트를 별도 파일로 불러와 첫 화면을 빠르게 한다.
  // INLINE_FONTS=1 로 빌드하면 CSS 안에 넣는다 (Claude 미리보기처럼 외부 파일을 막는 곳용).
  build: {
    target: ['es2019', 'safari14'], cssTarget: ['safari14'],
    assetsInlineLimit: (file) => (file.endsWith('.woff2') ? process.env.INLINE_FONTS === '1' : undefined),
  },
});
