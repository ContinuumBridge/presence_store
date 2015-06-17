
var Model = require('sworm').Model;

module.exports = Model.extend('Client', {

    defaults: {
        cbid: '',
        subscriptionAddresses: [],
        publicationAddresses: [],
        email: ''
    }
});
