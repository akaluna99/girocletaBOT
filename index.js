const client = new TwitterApi({
    appKey: process.env.CONSUMER_KEY,
    appSecret: process.env.CONSUMER_SECRET,
    accessToken: process.env.ACCESS_TOKEN,
    accessSecret: process.env.ACCESS_TOKEN_SECRET
});

import https from 'axios';
import { exit } from 'process';
import { TwitterApi } from 'twitter-api-v2';
import StaticMaps from 'staticmaps';

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
let coordinatesList = []
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
        console.log(mStation)
        coordinatesList.push(mStation) // latitude, longitude, name, empty_slots, free_bikes
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
//console.log(currentTime + '\n' + currentTwit)
const options = {
    width: 800,
    height: 900
};
const map = new StaticMaps(options);
const zoom = 14;
const center = [jsonGirocleta.network.location.longitude, jsonGirocleta.network.location.latitude];
var maxMap = {
    maxLat: 0,
    maxLon: 0,
    minLat: 100,
    minLon: 100
}
for (let currentStation of coordinatesList) {
    // latitude, longitude, name, empty_slots, free_bikes
    if (maxMap.maxLat < currentStation.latitude) {
        maxMap.maxLat = currentStation.latitude
    }
    if (maxMap.minLat > currentStation.latitude) {
        maxMap.minLat = currentStation.latitude
    }
    if (maxMap.maxLon < currentStation.longitude) {
        maxMap.maxLon = currentStation.longitude
    }
    if (maxMap.minLon > currentStation.longitude) {
        maxMap.minLon = currentStation.longitude
    }

    const text = {
        coord: [currentStation.longitude, currentStation.latitude],
        text: currentStation.name,
        size: 15,
        width: 0,
        fill: '#000000',
        color: '#000000',
        font: 'Arial Black',
        anchor: 'middle'
    };

    map.addText(text);

    const text2 = {
        coord: [currentStation.longitude, currentStation.latitude],
        text: '🚲:' + currentStation.free_bikes + ' 🔓:' + currentStation.empty_slots,
        offsetY: -15,
        size: 13,
        width: 0,
        fill: '#000000',
        color: '#000000',
        font: 'Arial',
        anchor: 'middle'
    };

    map.addText(text2);
}
console.log(maxMap.minLat + ' , ' + maxMap.minLon)
console.log(maxMap.maxLat + ' , ' + maxMap.maxLon)
await map.render([
    maxMap.minLon, maxMap.minLat,
    maxMap.maxLon, maxMap.maxLat
]);
//await map.render(center, zoom);
await map.image.save('center.png');

const mediaIds = await Promise.all([
    // file path
    client.v1.uploadMedia('./center.png'),
]);


//first twit
var result = await client.v2.tweet({
    text: currentTime + '\n' + currentTwit,
    media: { media_ids: mediaIds }

});
console.log(result)
postTwit(twits, result.data.id)
