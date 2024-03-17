const { postRequest } = require('./api');
const { sendEmail } = require('./mail');
const { loadStations, formatDate } = require('./util');
const config = require('../config');

const stations = loadStations();
const departureStationId = stations[config.departureStationName];
const arrivalStationId = stations[config.arrivalStationName];

const journeyUrl = "https://api-yebsp.tcddtasimacilik.gov.tr/sefer/seferSorgula";
const wagonUrl = "https://api-yebsp.tcddtasimacilik.gov.tr/vagon/vagonHaritasindanYerSecimi";

async function fetchAndFilterJourneys(departure, arrival, date, hour) {
    const formattedDate = formatDate(date ? date : config.date);

    console.log(`Departure: ${departure ? departure : config.departureStationName}`);
    console.log(`Arrival: ${arrival ? arrival : config.arrivalStationName}`);
    
    const requestBody = {
        "kanalKodu": 3,
        "dil": 0,
        "seferSorgulamaKriterWSDVO": {
          "satisKanali": 3,
          "binisIstasyonu": departure ? departure : config.departureStationName,
          "inisIstasyonu": arrival ? arrival : config.arrivalStationName,
          "binisIstasyonId": departureStationId,
          "inisIstasyonId": arrivalStationId,
          "binisIstasyonu_isHaritaGosterimi": false,
          "inisIstasyonu_isHaritaGosterimi": false,
          "seyahatTuru": 1,
          "gidisTarih": `${formattedDate} 00:00:00 AM`,
          "bolgeselGelsin": false,
          "islemTipi": 0,
          "yolcuSayisi": 1,
          "aktarmalarGelsin": true
        }
    };
    
    try {
        console.log(`Checking for date: ${formattedDate}`);
        const data = await postRequest(journeyUrl, requestBody);
        if (data['cevapBilgileri']['cevapKodu'] === '000') {
            for (const journey of data['seferSorgulamaSonucList']) {
                const journeyTime = new Date(journey['binisTarih']);
                if (config.checkSpecificHour) {
                    const specifiedTime = new Date(`${date ? date : config.date} ${hour ? hour : config.hour}`);
                    if (
                        journeyTime.getHours() === specifiedTime.getHours() &&
                        journeyTime.getMinutes() === specifiedTime.getMinutes()
                    ) {
                        await checkJourney(departure, arrival, journey);
                    }
                } else {
                    await checkJourney(departure, arrival, journey);
                }
            }
        }
    } catch (error) {
        console.error('Error fetching and filtering journeys: ', error);
    }
}

async function checkJourney(departure, arrival, journey) {
    console.log(`Checking for time: ${journey['binisTarih']}`);
    for (const wagon of journey['vagonTipleriBosYerUcret']) {
        for (const wagonDetail of wagon['vagonListesi']) {
            const wagonSequenceNumber = wagonDetail['vagonSiraNo'];
            console.log(`Checking for wagon: ${wagonSequenceNumber}`);
            await checkSpecificSeats(departure, arrival, journey['seferId'], wagonSequenceNumber, journey['trenAdi'], journey['binisTarih']);
        }
    }
}

async function checkSpecificSeats(departure, arrival, journeyId, wagonSequenceNo, trainName, departureTime) {
    const body = {
        "kanalKodu": "3",
        "dil": 0,
        "seferBaslikId": journeyId,
        "vagonSiraNo": wagonSequenceNo, 
        "binisIst": departure ? departure : config.departureStationName,
        "InisIst": arrival ? arrival : config.arrivalStationName,
    };

    try {
        const data = await postRequest(wagonUrl, body);

        if (data['cevapBilgileri']['cevapKodu'] === '000') {
            for (const seat of data['vagonHaritasiIcerikDVO']['koltukDurumlari']) {
                if (seat['durum'] === 0) { 
                    if (!seat['koltukNo'].endsWith('h')) { 
                        console.log(`Available seat: ${seat['koltukNo']} in Wagon ${wagonSequenceNo}`);
                        if (config.email.send) await sendEmail(trainName, departureTime, wagonSequenceNo, seat['koltukNo']);
                        return;
                    } 
                }
            }
        }
    } catch (error) {
        console.error('Error checking specific seats: ', error);
    }
}

module.exports = { fetchAndFilterJourneys };
