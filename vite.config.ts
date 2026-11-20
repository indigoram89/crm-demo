import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";

export default defineConfig({
  // Относительные пути: сборка открывается и с корня домена, и из подпапки GitHub Pages.
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {"@": "/src"},
  },
});
