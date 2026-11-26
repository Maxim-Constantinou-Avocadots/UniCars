// Optional vendor rebuild: npm install --no-save esbuild@0.28.2 react@19.2.8 react-dom@19.2.8
// Normal Wix builds use the committed browser bundle and need no npm install.
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
await build({
  entryPoints: [fileURLToPath(new URL('./id3-runtime-entry.mjs', import.meta.url))],
  outfile: fileURLToPath(new URL('../dist/id3-product/assets/index-Cur0LnY2.js', import.meta.url)),
  bundle: true,
  minify: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'inline'
});
