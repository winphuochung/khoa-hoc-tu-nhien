import { build } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

async function buildBundle() {
  await build({
    root: rootDir,
    configFile: false,
    plugins: [react()],
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    build: {
      outDir: path.join(rootDir, 'dist'),
      emptyOutDir: true,
      cssCodeSplit: false,
      lib: {
        entry: path.join(rootDir, 'src', 'main.tsx'),
        name: 'KHTN9App',
        formats: ['iife'],
        fileName: () => 'app.iife.js',
      },
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'app.css';
            }
            return 'assets/[name][extname]';
          },
        },
      },
    },
  });
  if (fs.existsSync(path.join(rootDir, 'public', 'logo.png'))) {
    fs.copyFileSync(path.join(rootDir, 'public', 'logo.png'), path.join(rootDir, 'dist', 'logo.png'));
  } else if (fs.existsSync(path.join(rootDir, 'logo.png'))) {
    fs.copyFileSync(path.join(rootDir, 'logo.png'), path.join(rootDir, 'dist', 'logo.png'));
  }
  console.log('[Build Standalone] Built dist/app.iife.js, dist/app.css, and copied dist/logo.png successfully.');
}

buildBundle().catch((err) => {
  console.error(err);
  process.exit(1);
});
