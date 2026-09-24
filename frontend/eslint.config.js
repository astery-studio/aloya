const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')

module.exports = defineConfig([
    expoConfig,
    {
        ignores: ['coverage/**', 'dist/**', 'dist-performance/**']
    },
    {
        files: ['test/**/*.{js,jsx}', 'tests/**/*.{js,jsx}'],
        languageOptions: {
            globals: {
                jest: 'readonly',
                describe: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly'
            }
        },
        rules: {
            'import/first': 'off'
        }
    }
])