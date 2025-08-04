import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/main'
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/preload'
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()],
    css: {
      preprocessorOptions: {
        scss: {
          // Silence deprecation warnings for Bootstrap compatibility
          silenceDeprecations: [
            'legacy-js-api', 
            'import',
            'global-builtin',
            'color-functions', 
            'mixed-decls'
          ]
        }
      }
    },
    build: {
      outDir: 'out/renderer'
    }
  }
} satisfies Parameters<typeof defineConfig>[0])