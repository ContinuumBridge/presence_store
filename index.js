var _ = require('underscore');
var express = require('express');
var app = express();
var localServer = require('http').Server(app);
var io = require('socket.io')(localServer);

var SocketIOStream = require('./swarm/socketIOStream');
var swarmHost = require('./swarm/host');
var Server = require('./swarm/models/server');

var servers = swarmHost.get('/Servers#servers', function() {

    console.log('servers are', servers.list());
});

localServer.listen(5000);

io.on('connection', function(socket){

    console.log('on connection');

    var stream = new SocketIOStream(socket);

    swarmHost.accept(stream, {delay: 50});

    socket.on('message', function(message) {
        console.log('received message', message)
    });
    socket.on('disconnect', function(){});
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
    var authenticated = servers.authenticate(id, token);

    console.log('authenticated ', authenticated );

    if (!authenticated) {
        return next(new Error('Unauthorized: Token is invalid'));
    } else {
        return next();
    }
});

// Bootstrap
var testServer = _.find(servers.list(), {id: 'dev-1'});
if (!testServer) {
    var testServer = new Server();
    testServer.on('.init', function () {
        if (this._version!=='!0') { return; };
        testServer.set({id: 'dev-1'});
        testServer.setToken('testing');
        servers.addObject(testServer);
    });
}

