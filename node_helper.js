var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({
    api_server: "https://developer-api.nest.com",
    start: function() {
        console.log('Starting node_helper for module [' + this.name + ']');
    },

    socketNotificationReceived: function(notification, payload) {

        if (notification === 'MMM_NEST_STATUS_GET') {

						var self = this;
            var token = payload.token;
            var url = self.api_server+'/?auth=' + token;
            
            request(url, {method: 'GET'}, function(err, res, body) {
								// did we have an error?
								if(err !== null){
									// send that up to module
									self.sendSocketNotification('MMM_NEST_STATUS_DATA_ERROR', err);
								}
								else {
									if (res.statusCode === 429) {
											self.sendSocketNotification('MMM_NEST_STATUS_DATA_BLOCKED', err);
									}
									// redirect?
									else if (res.statusCode === 307) {
											// set the new location
										 self.api_server= res.Location;
										 // and resend the request
										 self.socketNotificationReceived(notification,payload);
									} else if (res.statusCode !== 200) {										 
											self.sendSocketNotification('MMM_NEST_STATUS_DATA_ERROR', res.statusCode);
									} else {
											if (body === {}) {
													self.sendSocketNotification('MMM_NEST_STATUS_DATA_ERROR', 'Token works, but no data was received.<br>Make sure you are using the master account for your Nest.');
											} else {
													var data = JSON.parse(body);
													self.sendSocketNotification('MMM_NEST_STATUS_DATA', data);
											}
									}
								}

            });

        }
    }

});