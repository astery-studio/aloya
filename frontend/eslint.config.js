const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const globals = require('globals');

module.exports = defineConfig([
    globalIgnores(['coverage/**', 'dist/**', 'dist-performance/**', 'web-build/**']),
    expoConfig,
    {
        rules: {
            'no-console': ['warn', { allow: ['error', 'info', 'warn'] }],
            'no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                    varsIgnorePattern: '^_'
                }
            ],
            // Essas regras do React Compiler exigem uma migração dedicada dos
            // componentes animados existentes antes de poderem bloquear o CI.
            'react-hooks/refs': 'off',
            'react-hooks/set-state-in-effect': 'off',
            'react-hooks/use-memo': 'off'
        }
    },
    {
        files: ['test/**/*.{js,jsx}', 'tests/**/*.{js,jsx}'],
        languageOptions: {
            globals: globals.jest
        },
        rules: {
            // Alguns mocks precisam ser declarados antes dos imports avaliados
            // pelo Jest; a ordem é intencional nesses arquivos.
            'import/first': 'off'
        }
    }
]);
