import path from 'path';

const libSource = path.resolve('../lib');
const testingSources = [ libSource ];

export default {
    cache: true,
    output: {
        pathinfo: true
    },
    resolve: {
        root: libSource,
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
