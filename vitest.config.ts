import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/renderer/test/setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/tests/e2e/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/test/**',
        'src/**/*.test.{ts,tsx,js,jsx}',
        'src/**/*.spec.{ts,tsx,js,jsx}',
        'src/renderer/src/main.tsx',
        'src/renderer/src/vite-env.d.ts',
        'src/main/**/*',
        'src/preload/**/*',
        'src/renderer/src/types/**/*',
        'tests/e2e/**/*'
      ],
      thresholds: {
        statements: 60,
        branches: 60,
        functions: 60,
        lines: 60
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@main': resolve(__dirname, './src/main'),
      '@preload': resolve(__dirname, './src/preload'),
      '@renderer': resolve(__dirname, './src/renderer/src')
    }
  }
})