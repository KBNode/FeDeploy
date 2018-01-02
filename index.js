const spawn = require('child_process').spawn;
const fs = require('fs');
const express = require('express');
const app = express();
const argv = require('minimist')(process.argv.slice(2));

let config = JSON.parse(fs.readFileSync(argv.config));
let logStream = fs.createWriteStream(config.log);


function run_cmd(cmd, args, callback) {
    var spawn = require('child_process').spawn;
    var child = spawn(cmd, args, {env: process.env});
    var resp = "";

    child.stdout.on('data', function(buffer) {
        resp += buffer.toString();
    });
    child.stdout.on('end', function() {
        callback (resp)
    });
}

app.post('/web-hook', (req, res) => {
    let project = req.query.project,
        projectExec = config.projects[project].exec;
    run_cmd('sh', ['-c', projectExec], (text)=>{
        logStream.write(new Date() + '\n');
        logStream.write(text + '\n');
    });
    res.send('success');
});

app.listen(config.port, ()=>{
    console.log('Listning on port ' + config.port);
});
