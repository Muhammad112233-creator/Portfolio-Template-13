import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Keep this in sync with the GitHub repository name in GITHUB_PUBLISH_GUIDE.md.
// Local development and custom domains use '/'; GitHub project pages use a sub-path.
const githubPagesBase = '/Portfolio-Template-13/';

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? githubPagesBase : '/',
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
