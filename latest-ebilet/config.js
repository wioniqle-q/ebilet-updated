const config = {
    departureStationName: "",
    arrivalStationName: "",
    date: "",
    checkSpecificHour: true,
    hour: "",
    email: {
        send: false,
        address: "",
        password: "",
        destinationAddress: ""
    },
    sms: {
        to: "",
        from: "",
        accountSid: "",
        authToken: ""
    },
    sleepTime: 10
};

module.exports = config;
