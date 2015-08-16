import webpackTestConfig from './webpack';

export default function(config) {
    config.set({
        port: 3001,
        webpackPort: 3002,
        colors: true,
        basePath: './',
        files: [
            './setup.es6'
        ],

        // https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            './setup.es6': 'webpack'
        },

        // https://npmjs.org/browse/keyword/karma-adapter
        frameworks: [ 'mocha' ],
        webpack: webpackTestConfig,
        webpackMiddleware: {
            noInfo: true,
            quiet: true
        },

        // https://npmjs.org/browse/keyword/karma-reporter
        reporters: [ 'mocha', 'coverage' ],

        coverageReporter: {
            dir: '../coverage/',
            reporters: [
                {
                    type: 'html'
                },
                {
                    type: 'text-summary'
                },
                {
                    type: 'lcovonly', subdir: '.'
                }
            ]
        },

        // config.LOG_DISABLE
        // config.LOG_ERROR
        // config.LOG_WARN
        // config.LOG_INFO
        // config.LOG_DEBUG
        logLevel: config.LOG_DISABLE,

        browsers: [ 'Firefox' ],

        browserNoActivityTimeout: 30 * 1000, // default 10 * 1000
        browserDisconnectTimeout: 10 * 1000, // default 2 * 1000
        browserDisconnectTolerance: 1 // default 0
    });
}
