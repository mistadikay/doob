// https://github.com/webpack/karma-webpack#alternative-usage

// components
const libTests = require.context('./lib/', true, /\.es6$/);
const libSources = require.context('../lib/', true, /\.es6$/);

libTests.keys().forEach(libTests);
libSources.keys().forEach(libSources);
