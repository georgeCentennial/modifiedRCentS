import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const { PORT = 3000} = process.env;
import { resolve } from "path";

export default defineConfig({
  root: __dirname, // ensures that the client folder becomes the Vite root.
  plugins: [react()],
  build: {
    manifest: true,
    rollupOptions: {
      input: "./index.html",
    },
    outDir: 'dist',
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      "/auth": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/auth/, '')
      },
    },
  },
});

