
var _ = require('underscore');
var Set = require('swarm').Set;

module.exports = Set.extend('Servers', {

    authenticate: function(id, token) {

        var server = _.find(this.list(), {id: id});
        return server.authenticate(token);
    }
});