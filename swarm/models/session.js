
var Model = require('swarm').Model;

module.exports = Model.extend('Session', {

    defaults: {
        cbid: '',
        started: '',
        sessionID: '',
        server: ''
    }
});
