
var _ = require('underscore');
var passwordHash = require('password-hash');
var Model = require('swarm').Model;


module.exports = Model.extend('Server', {

    defaults: {
        //id: '',
        token: '',
        sessions: {type:Ref, value:'#0'}
    },


    reactions: {

        init: function (spec,val,src) {

            console.log('Server init');
            var self = this;
            var relations = {};

            logger.log('debug', 'Client init sessions', this.sessions);
            _.each(['sessions'], function(key) {
                if (self[key]._ref == '#0') {
                    relations[key] = swarmHost.get(format('/Sessions#%s%s', key, self._id));
                }
            });
            this.set(relations);
        }
    },

    setToken: function(token) {
        var hashed = passwordHash.generate(token);
        this.set({token: hashed});
    },

    authenticate: function(token) {
        return passwordHash.verify(token, this.token);
    }
});
