import { defineConfig } from 'vite';

// Port 5173 is pinned (strictPort) so the app never falls back to PDO's port 5172.
export default defineConfig({
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
  test: { environment: 'node' },
});
