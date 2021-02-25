import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import {exec} from 'child_process';
import dotenv from 'dotenv';

dotenv.config({path: "./server/.env"});

export function installServer() {
    return exec('npm i', {
        cwd: './server'
    });
}

export function installClient() {
    return exec('npm i', {
        cwd: './client'
    });
}

export function startServer(done) {
    return nodemon({
        script: 'server/index.mjs',
        watch: "./**/*",
        env: {
            ...process.env,
            NODE_ENV:'development'
        },
        done: done
    }).on('restart', ['startClient'])
    .on('start', ['startClient']);
}

export function startClient () {
    let app = exec(`npm start`, {
        cwd: './client',
        env: {
            ...process.env,
            REACT_APP_API_URL: `http://localhost:${process.env.SERVER_PORT}`
        }
    });
    app.on('message', d => console.log(d));
    app.stdout.on('data', d => console.log(d));
    app.stderr.on('data', d => console.error(d));
    return app;
}

export function buildClient() {
    return exec("npm run build", {
        cwd: './client'
    });
}

function copyClientBuild() {
    return gulp.src('client/build/**/*')
          .pipe(gulp.dest('build/client'))
}

function copyServer() {
    return gulp.src('server/**/*')
               .pipe(gulp.dest('build/'))
}

export let client = gulp.series(startClient)
export let dev = gulp.series(startServer)
export default gulp.series(installClient, installServer, buildClient, copyClientBuild, copyServer);