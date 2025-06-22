import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        widget: resolve(__dirname, "src/widget.jsx"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === "widget"
            ? "chat-widget.js"
            : "assets/[name]-[hash].js";
        },
        manualChunks: (id) => {
          // Bundle everything into the widget chunk for standalone use
          if (id.includes("src/widget.jsx") || id.includes("src/components/")) {
            return "widget";
          }
        },
      },
    },
  },
});
