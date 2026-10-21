const staticConfig = require('./app.json').expo;

const RELEASE_ENVIRONMENTS = new Set(['preview', 'production']);

function validateReleaseApiUrl(appEnvironment) {
    if (!RELEASE_ENVIRONMENTS.has(appEnvironment)) {
        return;
    }

    const rawApiUrl = process.env.EXPO_PUBLIC_API_URL;

    if (!rawApiUrl) {
        throw new Error(`EXPO_PUBLIC_API_URL must be configured for the ${appEnvironment} build.`);
    }

    const apiUrl = new URL(rawApiUrl);

    if (
        apiUrl.protocol !== 'https:' ||
        apiUrl.username ||
        apiUrl.password ||
        apiUrl.search ||
        apiUrl.hash
    ) {
        throw new Error(
            'Release builds require an HTTPS API URL without credentials, query parameters, or fragments.'
        );
    }
}

function configureBuildProperties(plugins, usesCleartextTraffic) {
    let foundBuildProperties = false;

    const configuredPlugins = plugins.map((plugin) => {
        const pluginName = Array.isArray(plugin) ? plugin[0] : plugin;

        if (pluginName !== 'expo-build-properties') {
            return plugin;
        }

        foundBuildProperties = true;
        const options = Array.isArray(plugin) ? plugin[1] || {} : {};

        return [
            'expo-build-properties',
            {
                ...options,
                android: {
                    ...options.android,
                    usesCleartextTraffic
                }
            }
        ];
    });

    if (!foundBuildProperties) {
        configuredPlugins.push([
            'expo-build-properties',
            {
                android: {
                    usesCleartextTraffic
                }
            }
        ]);
    }

    return configuredPlugins;
}

module.exports = ({ config = staticConfig } = {}) => {
    const appEnvironment = process.env.APP_ENV || 'development';
    const usesCleartextTraffic =
        appEnvironment === 'development' &&
        process.env.EXPO_PUBLIC_ALLOW_HTTP_FOR_TESTING === 'true';

    validateReleaseApiUrl(appEnvironment);

    return {
        ...config,
        ios: {
            ...config.ios,
            bundleIdentifier: 'com.aloya.app'
        },
        android: {
            ...config.android,
            package: 'com.aloya.app'
        },
        plugins: configureBuildProperties(config.plugins || [], usesCleartextTraffic),
        extra: {
            ...config.extra,
            appEnvironment
        }
    };
};
