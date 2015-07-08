var _ = require('underscore');
var express = require('express');
var app = express();
logger = require('./logger');

var localServer = require('http').Server(app);
var io = require('socket.io')(localServer);
localServer.listen(5000);

// Repl
var replify = require('replify')
    , app = require('http').createServer();
replify({ name: 'presence', path: '/tmp/repl' }, app);

var SocketIOStream = require('./swarm/socketIOStream');
swarmHost = require('./swarm/host');
env = {localhost: swarmHost};
var Server = require('./swarm/models/server');

//console.log('swarmHost', swarmHost);

servers = swarmHost.get('/Servers#servers', function() {

    //console.log('servers are', servers.list());
});

io.on('connection', function(socket){

    console.log('on connection');
    var server = socket.server;
    console.log('on connection server', server);

    var stream = new SocketIOStream(socket);

    swarmHost.accept(stream, {delay: 50});

    socket.on('message', function(message) {
        console.log('received message', message)
    });
    socket.on('disconnect', function(){
        server.sessions.target().disconnectAll();
    });
});

io.use(function(socket, next) {

    var id, token;
    var handshake = socket.handshake;

    console.log('on auth');
    if(handshake.headers && handshake.headers.cookie) {
        // Pull out the cookies from the data
        var cookies = cookie_reader.parse(handshake.headers.cookie);
        token = cookies.token;
        id = cookies.id;
    } else if (handshake.query && handshake.query.token) {
        token = handshake.query.token;
        id = handshake.query.id;
    } else {
        next(new Error('Unauthorized: No token was provided'));
    }

    console.log('Authorisation id token', id, token);
    //console.log('socket sessionID is', sessionID);
    //var authenticated = servers.authenticate(id, token);

    var server = socket.server = swarmHost.get('/Server#' + id);
    server.on('.init', function() {

        var authenticated = server.authenticate(token);
        console.log('authenticated ', authenticated );

        if (!authenticated) {
            return next(new Error('Unauthorized: Token is invalid'));
        } else {
            return next();
        }
    });
});

// Bootstrap
//testServer = swarmHost.get('/Server#dev_1');
testServer = new Server('dev_1');

testServer.on('.init', function() {
    console.log('testServer init', this._version);
    if (this._version!=='!0') { return; };
    //testServer.set({id: 'dev-1'});
    testServer.setToken('testing');
    servers.addObject(testServer);
});

testServer.on(function(spec, val, source) {
    console.log('testServer on', spec, val, source);
});

/*
testServer.on({deliver: function(spec) {
    console.log('testServer on', spec);
    //testServer.sessions.target(swarmHost).list();
}});
*/
