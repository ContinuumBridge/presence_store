
var Model = require('swarm').Model;

module.exports = Model.extend('Session', {

    defaults: {
        sessionid: '',
        cbid: '',
        subscriptionAddresses: [],
        publicationAddresses: [],
        email: ''
    }
});
