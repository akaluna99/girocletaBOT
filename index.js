var Twit = require('twit')
const config = require('./config');

// Using Twit library
const Bot = new Twit(config);
var d = new Date();
var currentTime = d.toLocaleString();
Bot.post('statuses/update', { status: 'TEST ' + currentTime }, function(err, data, response) {
  console.log(data)
})
