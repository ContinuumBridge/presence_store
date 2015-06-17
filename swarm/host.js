"use strict";

// Simple Swarm sync localServer: picks model classes from a directory,
// starts a WebSocket localServer at a port. Serves some static content,
// although I'd recomment to shield it with nginx.
var Swarm = require('swarm');
var Spec = Swarm.Spec;
var fs = require('fs');
var path = require('path');
var url = require('url');
var http = require('http');

var args = process.argv.slice(2);
var argv = require('minimist')(args, {
    alias: {
        models: 'm',
        port:  'p',
        debug: 'D',
        store: 's'
    },
    boolean: ['debug'],
    default: {
        models: './swarm/models/',
        store: '.swarm',
        port: 8000,
        debug: false
    }
});

Swarm.env.debug = argv.debug;

// use file storage
var fileStorage = new Swarm.FileStorage(argv.store);

// create Swarm Host
var swarmHost = new Swarm.Host('presence_store', 0, fileStorage);
Swarm.env.localhost = swarmHost;

/*
swarmHost.on({deliver: function(specString, two, three) {

    var spec = new Spec(specString);
    console.log('swarmHost on', spec);
    console.log('swarmHost on', two);
    console.log('swarmHost on', three);
    console.log('swarmHost on', spec.filter('.'));
    console.log('swarmHost on', spec.filter('#'));
}});
*/

process.on('SIGTERM', onExit);
process.on('SIGINT', onExit);
process.on('SIGQUIT', onExit);

process.on('uncaughtException', function (err) {
    console.error('Uncaught Exception: ', err, err.stack);
    onExit(2);
});

function onExit(exitCode) {
    //console.log('shutting down http-localServer...');
    //httpServer.close();

    if (!swarmHost) {
        console.log('swarm host not created yet...');
        return process.exit(exitCode);
    }

    console.log('closing swarm host...');
    var forcedExit = setTimeout(function () {
        console.log('swarm host close timeout');
        process.exit(exitCode);
    }, 5000);

    swarmHost.close(function () {
        console.log('swarm host closed');
        clearTimeout(forcedExit);
        process.exit(exitCode);
    });
}

// boot model classes
var modelPathList = argv.models;
modelPathList.split(/[:;,]/g).forEach(function (modelPath) {
    modelPath = path.resolve(modelPath);
    console.log('scanning',modelPath);
    var modelClasses = fs.readdirSync(modelPath), modelFile;
    while (modelFile = modelClasses.pop()) {
        if (!/^\w+\.js$/.test(modelFile)) { continue; }
        var modpath = path.join(modelPath, modelFile);
        var fn = require(modpath);
        if (fn.constructor !== Function) { continue; }
        //if (fn.extend !== Swarm.Syncable.extend) { continue; }
        if (!fn.extend) { continue; }
        console.log('Model loaded', fn.prototype._type, ' at ', modpath);
    }
});

module.exports = swarmHost;