
var _ = require('underscore');
var Set = require('swarm').Set;

module.exports = Set.extend('Servers', {

    authenticate: function(id, token) {

        //var server = _.find(this.list(), {id: id});
        //console.log('Servers authenticate spec', spec);
        console.log('Servers authenticate this.objects', this.objects);
        var server = this.objects['/Server#' + id];
        if (!server) {
            return false;
        } else {
            return server.authenticate(token);
        }
    }
});