import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://187.77.189.139/',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          // Prevent the proxy from buffering request bodies (fixes multipart/form-data corruption)
          proxy.on('proxyReq', (proxyReq, req) => {
            // If the request has a content-length, trust it and don't re-process
            if (req.headers['content-length']) {
              proxyReq.setHeader('content-length', req.headers['content-length']);
            }
          });
        },
      }
    }
  }
})
