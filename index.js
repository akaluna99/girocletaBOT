const client = new TwitterApi({
    appKey: '6pXo9b2KEGyBTmvG56iWCcUxR',
    appSecret: '9q8BjP4u1lH9kJegtTI1Z9wgaxMZnmyYzdS1eBDgZkbZbAnr3Q',
    accessToken: '1600487561914458113-udyo92YkfpT71a4HXWpGnq1L2YWOc5',
    accessSecret: 'I4rlxI0ks1MAjmf3B21LEtUF9Phg4kSa7ZyhpyyFRd7EU'
});

import https from 'axios';
import { exit } from 'process';
import { TwitterApi } from 'twitter-api-v2';

//console.log(result)
async function postTwit(twitsArray, lastId) {
    console.log(lastId)
    var nextTwit = twitsArray.shift()
    console.log(nextTwit)
    var twitResult = await client.v2.reply(
        nextTwit,
        lastId
    )
    if (twitsArray.length > 0) {
        postTwit(twitsArray, twitResult.data.id)
    }
}

var res = await https.get('https://api.citybik.es/v2/networks/girocleta')
console.log(res.data)

var d = new Date();
var currentTime = d.toLocaleString('es-ES', {
    timeZone: "Europe/Andorra"
});
let jsonGirocleta = res.data;//JSON.parse(res.data);
let twits = []
let twit = ''
for (let mStation of jsonGirocleta.network.stations) {
    if (mStation['free_bikes'] <= 5 || mStation['empty_slots'] <= 5) {
        twit += '\n🅿: ' + mStation['name'];
        if (mStation['free_bikes'] <= 5) {
            twit += '\n🚲: ' + String(mStation['free_bikes'] + ' ⚠️');
        } else {
            twit += '\n🚲: ' + String(mStation['free_bikes']);
        }
        if (mStation['empty_slots'] <= 5) {
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
if (twit == '' && twits.length == 0) {
    twit = '\nTotes les parades tenen un minim 10 bicicletes/aparcaments disponibles';
}
twits.push(twit);
var currentTwit = twits.shift()
console.log(currentTime + '\n' + currentTwit)

//first twit
var result = await client.v2.tweet({
    text: currentTime + '\n' + currentTwit
});
console.log(result)
postTwit(twits, result.data.id)
