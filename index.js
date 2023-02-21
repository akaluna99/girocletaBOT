const config = require('./config');

// Using Twit library
const Bot = new Twit(config);

Bot.post('statuses/update', { status: 'TEST' }, function(err, data, response) {
  console.log(data)
})
