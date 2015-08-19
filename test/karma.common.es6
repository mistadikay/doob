import path from 'path';

const babelConfig = JSON.stringify({
    optional: 'runtime',
    experimental: true
});

export default {
    colors: true,
    files: [
        'lib/*.es6'
    ],
    preprocessors: {
        'lib/*.es6': 'webpack'
    },
    frameworks: [ 'mocha' ],
    webpack: {
        cache: true,
        resolve: {
            root: path.resolve('./'),
            extensions: [ '', '.js', '.es6', '.json' ]
        },
        module: {
            preLoaders: [
                {
                    test: /\.es6$/,
                    exclude: path.resolve('lib/'),
                    loader: 'babel?' + babelConfig
                },
                {
                    test: /\.es6$/,
                    include: path.resolve('lib/'),
                    loader: 'isparta?{ babel: ' + babelConfig + ' }'
                }
            ]
        }
    },
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
    browserNoActivityTimeout: 60 * 1000, // default 10 * 1000
    browserDisconnectTimeout: 10 * 1000, // default 2 * 1000
    browserDisconnectTolerance: 2, // default 0
    captureTimeout: 2 * 60 * 1000 // default 1 * 60 * 1000
};
