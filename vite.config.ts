import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Removed lovable-tagger to prevent Vercel build errors
  ],
  resolve: {
    alias: {
      // Fixes the "__dirname is not defined" error in ESM modules
      "@": path.resolve("./src"), 
    },
  },
}));