const spawn = require('child_process').spawn;
const fs = require('fs');
const split2 = require('split2');
const through2 = require('through2');
const express = require('express');
const app = express();
const argv = require('minimist')(process.argv.slice(2));

let config = JSON.parse(fs.readFileSync(argv.config));
let logStream = fs.createWriteStream(config.log, {flags: 'a'});

function prefixStream (stream, prefix) {
    return stream.pipe(split2()).pipe(through2(function (data, enc, callback) {
        callback(null, prefix + data + '\n')
    }))
}

function run_cmd(cmd, args) {
    var spawn = require('child_process').spawn;
    var child = spawn(cmd, args, {env: process.env});

    child.on('close', function (code) {
        console.log(code);
    });

    prefixStream(child.stdout, '[' + new Date() + ']stdout: ').pipe(logStream, { end: false });
    prefixStream(child.stderr, '[' + new Date() + ']stderr: ').pipe(logStream, { end: false });
}

app.post('/web-hook', (req, res) => {
    let project = req.query.project,
        projectExec = config.projects[project].exec;
    projectExec = Array.isArray(projectExec) ? projectExec : [ 'sh', '-c', projectExec ];
    run_cmd(projectExec.shift(), projectExec);
    res.send('success');
});

app.listen(config.port, ()=>{
    console.log('Listning on port ' + config.port);
});
