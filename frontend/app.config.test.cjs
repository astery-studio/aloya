const assert = require('node:assert/strict');
const test = require('node:test');

const buildAppConfig = require('./app.config');
const staticConfig = require('./app.json').expo;

function withEnvironment(values, callback) {
    const previousValues = {};

    for (const [name, value] of Object.entries(values)) {
        previousValues[name] = process.env[name];

        if (value === undefined) {
            delete process.env[name];
        } else {
            process.env[name] = value;
        }
    }

    try {
        return callback();
    } finally {
        for (const [name, value] of Object.entries(previousValues)) {
            if (value === undefined) {
                delete process.env[name];
            } else {
                process.env[name] = value;
            }
        }
    }
}

function getAndroidBuildProperties(config) {
    const plugin = config.plugins.find(
        (candidate) => Array.isArray(candidate) && candidate[0] === 'expo-build-properties'
    );

    return plugin[1].android;
}

test('production requires an HTTPS API and disables cleartext traffic', () => {
    withEnvironment(
        {
            APP_ENV: 'production',
            EXPO_PUBLIC_API_URL: 'https://api.aloya.example',
            EXPO_PUBLIC_ALLOW_HTTP_FOR_TESTING: 'true'
        },
        () => {
            const config = buildAppConfig({ config: staticConfig });

            assert.equal(config.android.package, 'com.aloya.app');
            assert.equal(config.ios.bundleIdentifier, 'com.aloya.app');
            assert.equal(getAndroidBuildProperties(config).usesCleartextTraffic, false);
        }
    );
});

test('release builds reject missing or insecure API URLs', () => {
    for (const apiUrl of [undefined, 'http://api.aloya.example']) {
        assert.throws(
            () =>
                withEnvironment(
                    {
                        APP_ENV: 'production',
                        EXPO_PUBLIC_API_URL: apiUrl
                    },
                    () => buildAppConfig({ config: staticConfig })
                ),
            /EXPO_PUBLIC_API_URL|HTTPS API URL/
        );
    }
});

test('development enables cleartext only through the explicit testing flag', () => {
    withEnvironment(
        {
            APP_ENV: 'development',
            EXPO_PUBLIC_API_URL: undefined,
            EXPO_PUBLIC_ALLOW_HTTP_FOR_TESTING: 'true'
        },
        () => {
            const config = buildAppConfig({ config: staticConfig });

            assert.equal(getAndroidBuildProperties(config).usesCleartextTraffic, true);
        }
    );
});
