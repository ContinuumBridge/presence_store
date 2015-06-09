
var passwordHash = require('password-hash');
var Model = require('swarm').Model;

module.exports = Model.extend('Server', {

    defaults: {
        id: '',
        token: '',
        sessions: ''
    },

    setToken: function(token) {
        var hashed = passwordHash.generate(token);
        this.set({token: hashed});
    },

    authenticate: function(token) {
        return passwordHash.verify(token, this.token);
    }
});
