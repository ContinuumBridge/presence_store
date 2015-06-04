var _ = require('underscore');
var express = require('express');
var app = express();
var localServer = require('http').Server(app);
var io = require('socket.io')(localServer);

var SocketIOStream = require('./swarm/socketIOStream');
var swarmHost = require('./swarm/host');
var Server = require('./models/server');

var servers = swarmHost.get('/Servers#servers', function() {

    console.log('servers are', servers.list());
});

localServer.listen(4500);

io.on('connection', function(socket){

    var stream = new SocketIOStream(socket);

    swarmHost.accept(stream, {delay: 50});

    socket.on('message', function(message) {
        console.log('received message', message)
    });
    socket.on('disconnect', function(){});
});

io.use(function(socket, next) {

    var token;
    var handshake = socket.handshake;

    if(handshake.headers && handshake.headers.cookie) {
        // Pull out the cookies from the data
        var cookies = cookie_reader.parse(handshake.headers.cookie);
        token = cookies.token;
    } else if (handshake.query && handshake.query.token) {
        token = handshake.query.token;
    } else {
        next(new Error('Unauthorized: No token was provided'));
    }

    console.log('Authorisation token', token);
    //console.log('socket sessionID is', sessionID);
    var server = _.find(servers.list(), {token: token});
    if (!server) {
        return next(new Error('Unauthorized: Token is invalid'));
    }
});

// Bootstrap
var testServer = _.find(servers.list(), {token: 'test'});
if (!testServer) {
    var testServer = new Server();
    testServer.on('.init', function () {
        if (this._version!=='!0') { return; };
        testServer.set({
            token: 'testing'
        });
        servers.addObject(testServer);
    });
}

