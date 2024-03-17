const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const config = require('../config');

function sendEmail(trainName, departureDate, wagonNumber, seatNumber) {
    const transporter = nodemailer.createTransport(
        smtpTransport({
          service: 'yandex',
          host: 'smtp.yandex.com',
          port: 587,
          secure: true,
          auth: {
            user: config.email.address,
            pass: config.email.password
          }
        })
    );

    const mailOptions = {
        from: config.email.address,
        to: config.email.destinationAddress, 
        subject: 'TCDD Seat Information - Automated Email',
        text: `Seat ${seatNumber} in Wagon ${wagonNumber} of ${trainName} on ${departureDate}.`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error('Email error: ' + error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = { sendEmail };
