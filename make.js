// build scripts for the project

var util = require('./make-util');
var fs = require('fs');

var argv = require('minimist')(process.argv.slice(2));


var run = util.run;

var CLI = {};

CLI.build = function(args) {
    run('npm install', true); // static code analysis
    run('npm install', true, 'actions/submit-signing-request'); // static code analysis

    run('npm run lint', true); // static code analysis

    // transpile TypeScript to JavaScript
    run('tsc --rootDir actions');
    run('ncc build index.js -o dist', true, 'actions/submit-signing-request');

    run('npm run test', true); // unit tests
}

CLI.test = function(args) {
    // transpile TypeScript to JavaScript
    run('tsc --rootDir actions');
    try {
      run('mocha actions/*/tests/**/*.js --reporter mocha-teamcity-reporter', /*inheritStreams:*/true);
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
