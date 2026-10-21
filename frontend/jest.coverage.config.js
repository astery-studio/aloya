const packageJson = require('./package.json');

module.exports = {
    ...packageJson.jest,
    coverageThreshold: {
        global: {
            branches: 87,
            functions: 89,
            lines: 90,
            statements: 89
        }
    },
    testTimeout: 15000
};
