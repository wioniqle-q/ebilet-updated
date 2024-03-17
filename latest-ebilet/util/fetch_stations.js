const axios = require('axios');
const fs = require('fs');

const url = "https://api-yebsp.tcddtasimacilik.gov.tr/istasyon/istasyonYukle";

const body = {
    kanalKodu: "3",
    dil: 1,
    tarih: "Nov 10, 2011 12:00:00 AM",
    satisSorgu: true
};

const headers = {
    'Authorization': 'Basic ZGl0cmF2b3llYnNwOmRpdHJhMzQhdm8u'
};

async function fetchStations() {
    axios.post(url, body, { headers })
    .then(response => {
        const stations = response.data.istasyonBilgileriList.reduce((acc, station) => {
            acc[station.istasyonAdi] = station.istasyonId;
            return acc;
        }, {});

        fs.writeFileSync('stations.json', JSON.stringify(stations, null, 4), 'utf-8');

        console.log("Station names and IDs have been saved to stations.json");
    })
    .catch(error => {
        console.error('Error:', error.message);
    });
}


module.exports = { fetchStations };