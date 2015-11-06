import karmaCommon from './karma.common';

module.exports = function(config) {
    config.set({
        ...karmaCommon,
        singleRun: true,
        logLevel: config.LOG_DISABLE,
        reporters: [ 'mocha', 'coverage' ],
        coverageReporter: {
            ...karmaCommon.coverageReporter,
            reporters: [
                ...karmaCommon.coverageReporter.reporters,
                {
                    type: 'html'
                },
                {
                    type: 'text'
                },
                {
                    type: 'text-summary'
                }
            ]
        },
        customLaunchers: {
            ChromeCustom: {
                base: 'Chrome',
                flags: [
                    '--window-size=0,0',
                    '--window-position=0,0'
                ]
            }
        },
        browsers: [ 'ChromeCustom' ]
    });
};
