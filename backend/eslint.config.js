import js from '@eslint/js';
import globals from 'globals';

export default [
    {
        ignores: ['coverage/**', 'node_modules/**', 'prisma/*.db*', 'src/generated/**']
    },
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            globals: globals.node,
            sourceType: 'module'
        },
        rules: {
            'no-console': ['warn', { allow: ['error', 'info', 'warn'] }],
            'no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                    varsIgnorePattern: '^_'
                }
            ]
        }
    }
];
