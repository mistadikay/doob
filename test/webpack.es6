import path from 'path';

const testingSources = [ path.resolve('../lib') ];

export default {
    cache: true,
    output: {
        pathinfo: true
    },
    resolve: {
        root: path.resolve('../'),
        extensions: [ '', '.js', '.es6' ]
    },
    module: {
        preLoaders: [
            {
                test: /\.es6$/,
                exclude: testingSources,
                loader: 'babel'
            },
            {
                test: /\.es6$/,
                include: testingSources,
                loader: 'isparta'
            }
        ]
    }
};
