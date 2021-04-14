'use strict';
const AWS = require('aws-sdk');
const config = require('./config');

const STATIC = {
    MESSAGE: {
        SUBJECT: `${config.REGION} Vaxx Available Appointments`
    },
    AWS: {
        ARN: config.AWS_ARN,
        REGION: config.AWS_REGION,
        KEY: config.AWS_KEY,
        SECRET: config.AWS_SECRET
    }
};

AWS.config.update({
    region: STATIC.AWS.REGION,
    accessKeyId: STATIC.AWS.KEY,
    secretAccessKey: STATIC.AWS.SECRET,
});

function sendMessage(body) {
    const params = {
        Message: body,
        Subject: STATIC.MESSAGE.SUBJECT,
        TopicArn: STATIC.AWS.ARN
    };

    if (typeof STATIC.AWS.KEY !== 'string' || STATIC.AWS.KEY.length === 0) {
        console.log('SNS not configured, message not sent:', params);
        return;
    }

    const publishTextPromise = new AWS.SNS({
        apiVersion: '2010-03-31'
    }).publish(params).promise();

    // Handle promise's fulfilled/rejected states
    publishTextPromise.then(
        function (data) {
            console.log(`Message ${params.Subject} sent to the topic ${params.TopicArn}`);
            console.log(`MessageID is ${data.MessageId}`);
        }).catch(
        function (err) {
            console.error(err, err.stack);
        });

}


module.exports = {
    sendMessage
}