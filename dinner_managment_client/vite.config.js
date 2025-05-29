import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// שימי base: '/REPO_NAME/'
export default defineConfig({
  plugins: [react()],
});
