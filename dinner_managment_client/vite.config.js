import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // חשוב מאוד — מאפשר גישה חיצונית דרך כתובת IP
    port: 5173      
  }
});
