const https = require('https');
const { exit } = require('process');
var Twit = require('twit');
const config = require('./config');

// Using Twit library
const Bot = new Twit(config);

function postTwit(twitsArray, lastId){
  console.log(lastId)
  var nextTwit = twitsArray.shift()
  Bot.post('statuses/update', { 
    status: nextTwit,
    in_reply_to_status_id : lastId,
    auto_populate_reply_metadata : true
  }, function(err, data, response) {
    if (twitsArray.length > 0){
      postTwit(twitsArray, data.id_str);
    }
  })
}

https.get('https://api.citybik.es/v2/networks/girocleta', (resp) => {

  let data = '';

  // A chunk of data has been received.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    var d = new Date();
    var currentTime = d.toLocaleString('es-ES',{
                    timeZone: "Europe/Andorra"
                });
    let jsonGirocleta = JSON.parse(data);
    let twits = []
    let twit = ''
    for (let mStation of jsonGirocleta.network.stations) {
      if (mStation['free_bikes'] <= 5 || mStation['empty_slots'] <= 5){
        twit += '\n🅿: ' + mStation['name'];
        if (mStation['free_bikes'] <= 5){
          twit += '\n🚲: ' + String(mStation['free_bikes'] + ' ⚠️');
        } else {
          twit += '\n🚲: ' + String(mStation['free_bikes']);
        }
        if (mStation['empty_slots'] <= 5){
          twit += '\n🔓: ' + String(mStation['empty_slots'] + ' ⚠️');
        } else {
          twit += '\n🔓: ' + String(mStation['empty_slots']);
        }
        twit += '\n'; 
      }
      
      if (twit.length > 200) {
        twits.push(twit)
        twit = ''
      }
    }
    if (twit == '' && twits.length == 0){
      twit = '\nTotes les parades tenen un minim 10 bicicletes/aparcaments disponibles';
    }
    twits.push(twit);
    var currentTwit = twits.shift()
    Bot.post('statuses/update', { 
      status:  currentTime + '\n' + currentTwit
    }, function(err, data, response) {
      postTwit(twits, data.id_str)
    }); 
      
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});

//Bot.post('statuses/update', { status: 'TEST 123' }, //function(err, data, response) {
//  console.log(data)
//})
