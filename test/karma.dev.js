import karmaCommon from './karma.common';

export default function(config) {
    config.set({
        ...karmaCommon,
        logLevel: config.LOG_INFO,
        reporters: [ 'clear-screen', 'mocha', 'coverage' ],
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
}
