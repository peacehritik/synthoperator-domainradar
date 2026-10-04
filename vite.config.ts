import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import fs from 'fs';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'APP_']);
  const appName = env.APP_NAME || 'DomainRadar';
  const appUrl = env.APP_URL || 'https://domainradar.ai';
  
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'html-vars-substitution',
        transformIndexHtml(html) {
          return html
            .replace(/%__APP_NAME__%/g, appName)
            .replace(/%__APP_URL__%/g, appUrl)
            .replace(/%APP_NAME%/g, appName)
            .replace(/%APP_URL%/g, appUrl);
        }
      },
      {
        name: 'manifest-vars-substitution',
        generateBundle() {
          const manifestPath = 'public/manifest.json';
          if (fs.existsSync(manifestPath)) {
            let content = fs.readFileSync(manifestPath, 'utf-8');
            content = content
              .replace(/%APP_NAME%/g, appName)
              .replace(/%APP_URL%/g, appUrl);
            this.emitFile({
              type: 'asset',
              fileName: 'manifest.json',
              source: content
            });
          }
        }
      }
    ],
    envPrefix: ['VITE_', 'APP_'],
    define: {
      'import.meta.env.APP_NAME': JSON.stringify(appName),
      'import.meta.env.APP_URL': JSON.stringify(appUrl),
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
              return 'vendor-libs';
            }
          },
        },
      },
    },
  };
});