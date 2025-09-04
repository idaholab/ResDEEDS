const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const react = require('eslint-plugin-react');
const globals = require('globals');

module.exports = tseslint.config(
  // Global ignores
  {
    ignores: [
      'out/**',
      'node_modules/**',
      'dist/**',
      '*.min.js',
      'coverage/**',
      'ai_docs/**',
      'src/backend/.venv/**',
      'src/backend/build/**',
      'src/backend/dist/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: {
      react,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      '@typescript-eslint/no-explicit-any': 'warn', // Allow any with warning
      '@typescript-eslint/no-unused-vars': 'warn', // Allow unused vars with warning
      '@typescript-eslint/no-require-imports': 'off', // Allow require imports
      'no-case-declarations': 'warn', // Allow case declarations with warning
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  // ESLint config file specific rules
  {
    files: ['eslint.config.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  // Main process files (Node.js)
  {
    files: ['src/main/**/*.{js,ts}', 'src/preload/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  // Renderer process files (Browser)
  {
    files: ['src/renderer/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  // Config files
  {
    files: ['*.config.{js,ts}', '*.config.*.{js,ts}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  }
);