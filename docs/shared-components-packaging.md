# Packaging rippl-shared-components for External Use

## The Problem

The `rippl-shared-components` library uses TypeScript path aliases like:

```tsx
import { Something } from '@components/Utility'
```

These aliases are defined in `tsconfig.json` and work great during local development. However, when another project installs the library as a dependency:

```json
"rippl-shared-components": "git+https://github.com/ripplcare/rippl-shared-components.git"
```

The consuming project's bundler (Vite, Webpack, etc.) can't resolve `@components/Utility` because:
1. It's not a real file path
2. It's not a node module
3. The alias configuration doesn't transfer to consuming projects

**Result:** Build fails with errors like:
```
Rollup failed to resolve import "@components/Utility" from "node_modules/rippl-shared-components/..."
```

---

## The Solution: Bundle Before Publishing

Instead of publishing raw source files, bundle the library so all imports are resolved at build time.

### Step 1: Install tsup (simple bundler for libraries)

```bash
npm install -D tsup
```

### Step 2: Create tsup.config.ts

```ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,  // Generate TypeScript declarations
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@mui/material',
    '@mui/icons-material',
    '@emotion/react',
    '@emotion/styled',
  ],
  // This resolves path aliases at build time
  esbuildOptions(options) {
    options.alias = {
      '@components': './src/components',
      // Add other aliases here
    }
  },
})
```

### Step 3: Update package.json

```json
{
  "name": "rippl-shared-components",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",
    "@mui/material": "^6.0.0",
    "@emotion/react": "^11.0.0",
    "@emotion/styled": "^11.0.0"
  }
}
```

### Step 4: Add dist to .gitignore (optional)

If you don't want to commit built files:
```
dist/
```

But for git-based installs (not npm registry), you may want to **include** `dist/` in the repo so consumers don't need to build.

### Step 5: Build and commit

```bash
npm run build
git add .
git commit -m "Add library bundling for external consumption"
git push
```

---

## Alternative: Vite Library Mode

If you're already using Vite, you can use its library mode instead of tsup.

### vite.config.ts

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'RipplSharedComponents',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@mui/material', '@emotion/react', '@emotion/styled'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
})
```

---

## Testing the Fix

After bundling, test in a consuming project:

```bash
# In consuming project
rm -rf node_modules/rippl-shared-components
npm install

# Should work now
npm run build
```

---

## Summary

| Before | After |
|--------|-------|
| Publishing raw `.tsx` source files | Publishing bundled `.js` + `.d.ts` files |
| Path aliases unresolved | Path aliases resolved at build time |
| Consumers can't build | Consumers can build normally |

The key insight: **path aliases are a development convenience, not a distribution format**. Bundle your library to resolve them before publishing.

---

## Questions?

Reach out to the team if you need help setting this up.
