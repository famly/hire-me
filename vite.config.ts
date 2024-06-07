import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public', // This is the default setting, pointing to the public directory
  build: {
    outDir: 'dist', // Output directory for the build
  },
  server: {
    port: 3000, // Port to serve the app
  },
});
