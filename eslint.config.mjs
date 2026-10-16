import next from 'eslint-config-next/core-web-vitals';

/** ESLint flat config（TECH_DESIGN §1 质量项）。 */
const config = [
  {
    ignores: ['.next/**', 'node_modules/**', '.npm-cache/**', 'next-env.d.ts', 'public/**'],
  },
  ...next,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // AGENTS.md §6：生产代码禁止残留 console.log
      'no-console': ['error', { allow: ['warn', 'error'] }],
      // AGENTS.md §4.1：禁止 any
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      // AGENTS.md §4.5：禁止用 dangerouslySetInnerHTML 渲染未 sanitize 的内容。
      // 开启该规则后，任何使用都必须带同行的 eslint-disable 说明理由。
      'react/no-danger': 'error',
    },
  },
];

export default config;
