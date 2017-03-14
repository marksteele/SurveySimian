'use strict';
const uuid = require('uuid/v4');
const AWS = require('aws-sdk');
const sqs = new AWS.SQS({region: process.env.REGION});
const queueName = process.env.SQS_QUEUE_URL;
const s3 = new AWS.S3();
const bucketName = process.env.BUCKET_NAME;

module.exports.save = (event, context, callback) => {
  var messages = [];
  receiveMessages(callback,messages);
};

function receiveMessages(callback,messages) {
  var sqsParams = {
    MaxNumberOfMessages: 10,
    QueueUrl: queueName
  };
  sqs.receiveMessage(sqsParams, (err, data) => {
    if (err) {
      // Error reading from sqs
      console.log(err);
      callback(null,"ERROR");
    } else { // No errors fetching from sqs
      if (data && data.Messages && data.Messages.length > 0) {
        // We have messages to process
        messages = messages.concat(data.Messages);
        // Call recursively until nothing in queue
        receiveMessages(callback,messages);
      } else {
        // There are no messages left in queue
        if (messages && messages.length > 0) {
          // We have some in memory to save
          processMessages(callback,messages);
        } else {
          // No messages, all done
          callback(null,"DONE");
        }
      }
    }
  });
}

function processMessages(callback,messages) {
  var output = [];
  var receipts = [];
  messages.forEach(msg => {
    var data = JSON.parse(msg.Body);
    if (typeof output[data.date] !== "undefined") {
      output[data.date] += "\n" + msg.Body;
      receipts[data.date].push(msg.ReceiptHandle);
    } else {
      output[data.date] = msg.Body;
      receipts[data.date] = [msg.ReceiptHandle];
    }
  });
  Object.keys(output).forEach(x => {
    s3.putObject({
      Bucket: bucketName,
      Key: "date=" + x + "/" + uuid(),
      Body: // parquet formatted data ...
    }, (err,y) => {
      if (err) {
        // Error saving item
        console.log(err);
        callback("error");
      } else {
        // Clear out receipts for batch
        receipts[x].forEach(receipt => {
          sqs.deleteMessage({QueueUrl: queueName, ReceiptHandle: receipt}, re => {
            if (re) {
              // Error deleting message
              console.log(re);
              callback("error");
            }
          });
        });
      }
    });
    callback(null);

}
