import webpackTestConfig from './webpack';

export default {
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

    coverageReporter: {
        dir: '../coverage',
        reporters: [
            { type: 'lcovonly', subdir: '.' }
        ]
    },

    browserNoActivityTimeout: 30 * 1000, // default 10 * 1000
    browserDisconnectTimeout: 10 * 1000, // default 2 * 1000
    browserDisconnectTolerance: 1 // default 0
};
