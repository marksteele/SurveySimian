'use strict';
const uuid = require('uuid/v4');
const AWS = require('aws-sdk');
const sqs = new AWS.SQS({region: process.env.REGION});
const queueName = process.env.SQS_QUEUE_URL;

module.exports.save = (event, context, callback) => {
  var data = JSON.parse(event.body);
  data.date = new Date().toISOString().split('T')[0];
  data.id = uuid();
  var email = data.email;
  delete data.email;
  var sqsParams = {
    MessageBody: JSON.stringify(data),
    QueueUrl: queueName
  };
  sqs.sendMessage(sqsParams,(err,resp) => {
    if (err) {
      console.log("Error sending message: ");
      console.log(err);
      callback(null,{statusCode: 500, body: err});
    } else {
      console.log("Queued in SQS");
      callback(null,{
        statusCode: 200,
        body: "OK",
        headers: {
          "Access-control-allow-origin": "*"
        }
      });
    }
  });
};
