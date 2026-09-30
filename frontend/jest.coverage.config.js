const packageJson = require('./package.json');

module.exports = {
    ...packageJson.jest,
    coverageThreshold: undefined,
    testTimeout: 15000
};
