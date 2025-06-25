import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                widget: resolve(__dirname, "src/widget.jsx"),
            },
            output: {
                entryFileNames: "chat-widget.js",
                format: "iife",
                name: "ChatWidget",
            },
        },
    },
});
