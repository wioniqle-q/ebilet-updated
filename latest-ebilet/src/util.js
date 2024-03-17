const fs = require('fs');
const path = require('path');

function loadStations() {
    const filePath = path.join(__dirname, '..', 'stations.json');
    const data = fs.readFileSync(filePath, { encoding: 'utf-8' });
    
    return JSON.parse(data);
}

function formatDate(date) {
    if (typeof date !== 'string') {
        throw new TypeError('date must be a string');
    }
    
    const [year, month, day] = date.split('-');
    const dateObj = new Date(year, month - 1, day);
    
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(dateObj);
}

module.exports = { loadStations, formatDate };
