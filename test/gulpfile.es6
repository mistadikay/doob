import gulp from 'gulp';
import path from 'path';
import del from 'del';

import { Server } from 'karma';
import { parseConfig } from 'karma/lib/config';

gulp.task('clean:test', done => {
    del('coverage/', done);
});

gulp.task('karma:build', function(done) {
    const karmaConfigPath = path.resolve('./karma');
    const karmaServer = new Server(
        {
            configFile: karmaConfigPath,
            singleRun: true,
            autoWatch: false
        },
        () => {
            done();
        }
    );

    karmaServer.start();
});

gulp.task('karma:dev', function(done) {
    const karmaConfigPath = path.resolve('./karma');
    const karmaConfig = parseConfig(karmaConfigPath, {});
    const karmaServer = new Server(
        {
            configFile: karmaConfigPath,
            singleRun: false,
            autoWatch: true,
            reporters: [ 'clear-screen' ].concat(karmaConfig.reporters)
        },
        done
    );

    karmaServer.start();
});

gulp.task('test:build', gulp.series('clean:test', 'karma:build'));
gulp.task('test:dev', gulp.series('clean:test', 'karma:dev'));
