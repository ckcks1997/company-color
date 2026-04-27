const js = require('@eslint/js')
const globals = require('globals')
const react = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')
const reactRefresh = require('eslint-plugin-react-refresh')
const prettierConfig = require('eslint-config-prettier')
const tseslint = require('typescript-eslint')

const reactSharedRules = {
  ...react.configs.recommended.rules,
  ...react.configs['jsx-runtime'].rules,
  ...reactHooks.configs.recommended.rules,
  'react/jsx-no-target-blank': 'off',
  'react/prop-types': 'off',
  'react-refresh/only-export-components': [
    'warn',
    {
      allowConstantExport: true,
      // Next.js App Router 의 특수 export
      allowExportNames: [
        'metadata',
        'viewport',
        'generateMetadata',
        'generateViewport',
        'generateStaticParams',
        'dynamic',
        'dynamicParams',
        'revalidate',
        'fetchCache',
        'runtime',
        'preferredRegion',
      ],
    },
  ],
  'react-hooks/set-state-in-effect': 'error',
  'react-hooks/immutability': 'error',
}

const browserAndNodeGlobals = {
  ...Object.fromEntries(
    Object.entries(globals.browser).map(([key, value]) => [key.trim(), value])
  ),
  ...globals.node,
}

module.exports = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'public/**',
      'coverage/**',
      'next-env.d.ts',
    ],
  },

  // .js / .jsx — 설정 파일과 잔여 JS
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: browserAndNodeGlobals,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '19.0' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactSharedRules,
      ...prettierConfig.rules,
    },
  },

  // .ts / .tsx — 애플리케이션 코드
  ...tseslint.configs.recommended.map((cfg) => ({
    ...cfg,
    files: ['**/*.{ts,tsx}'],
  })),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: browserAndNodeGlobals,
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '19.0' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactSharedRules,
      // TS의 미사용 변수는 typescript-eslint 룰에 위임
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      ...prettierConfig.rules,
    },
  },
]
