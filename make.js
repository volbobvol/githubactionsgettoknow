// build scripts for the project

var util = require('./make-util');
var fs = require('fs');

var argv = require('minimist')(process.argv.slice(2));


var run = util.run;

var CLI = {};

CLI.build = function(args) {

    run('npm install', true); // static code analysis

    run('npm install', true, 'Tasks/DownloadSignedArtifact'); // static code analysis
    run('npm install', true, 'Tasks/SubmitSigningRequest'); // static code analysis

    run('npm run lint', true); // static code analysis
    run('npm run test', true); // unit tests

    // transpile TypeScript to JavaScript
    run('tsc --rootDir tasks');
}

CLI.test = function(args) {
    // transpile TypeScript to JavaScript
    run('tsc --rootDir tasks');
    try {
      run('mocha Tasks/*/Tests/**/*.js --reporter mocha-teamcity-reporter', /*inheritStreams:*/true);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

var command  = argv._[0];

if (typeof CLI[command] !== 'function') {
  fail('Invalid CLI command: "' + command + '"\r\nValid commands:' + Object.keys(CLI));
}

CLI[command](argv);
