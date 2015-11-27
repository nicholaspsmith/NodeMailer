// Set up express framework
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded(
  {extended:true}
));
app.use(bodyParser.json());

// Set up context.io
var ContextIO = require('contextio');
var ctxCfg = require('./contextConfig');
var ctxioClient = new ContextIO.Client('2.0', {
  key: ctxCfg.key,
  secret: ctxCfg.secret
});

// Set up AWS
var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1'
var machinelearning = new AWS.MachineLearning();

// include json2csv
var json2csv = require('json2csv');

// include fs for writing files
var fs = require("fs");

var moment = require("moment");

// @TODO
// create 2 csv's from 2 different email accounts
// starscater - training data (pull in all emails, mark amazon's as 1, others as 0)
// unsignedn - check data (same thing)

// train algorithm using startscater csv data
// check algorithm using unsignedn csv data


// API Endpoints

app.get('/aol',function (req, res) {
  ctxioClient.accounts(ctxCfg.aol).messages().get({include_body:1}, function (err, response) {
    if (err) throw err;
    var body = response.body;

    var fields = [
      'addresses.from.email',
      'body[0].content',
      {
        label: 'amazon_receipt',
        value: function(row) {if (row.addresses.from.email === 'auto-confirm@amazon.com') {return 1;} return 0;},
        default: 0
      }
    ];
    // convert body to csv and save to file
    json2csv({ data: body, fields: fields }, function(err, csv) {
      if (err) console.log(err);
      // Filename based on current time
      var filename = 'aol-emails-' + moment().format('MDhhmmss');
      fs.writeFile(filename + '.csv', csv, function(err) {
        if (err) throw err;
          res.status(200).send('Saved to file.csv');
      });
    });
  });
});

app.get('/unsignedn',function (req, res) {
  ctxioClient.accounts(ctxCfg.unsignedn).messages().get({include_body:1}, function (err, response) {
    if (err) throw err;
    var body = response.body;

    var fields = [
      'addresses.from.email',
      'body[0].content',
      {
        label: 'amazon_receipt',
        value: function(row) {if (row.addresses.from.email === 'auto-confirm@amazon.com') {return 1;} return 0;},
        default: 0
      }
    ];

    // convert body to csv and save to file
    json2csv({ data: body, fields: fields }, function(err, csv) {
      if (err) console.log(err);
      // Filename based on current time
      var filename = 'aol-emails-' + moment().format('MDhhmmss');
      fs.writeFile(filename + '.csv', csv, function(err) {
        if (err) throw err;
          res.status(200).send('Saved to file.csv');
      });
    });
  });
});

app.post('/', function (req, res) {
  res.send('POST request to the homepage');
});

app.post('/received', function(req, res){
  var message_id = req.body.message_id;

  // get content of message
  // https://api.context.io/2.0/accounts/id/messages/message_id
  ctxioClient.accounts(ctxCfg.unsignedn).messages(message_id).get({include_body:1,}, function (err, response) {
    if (err) throw err;
    // body[0] is text/plain
    var body = response.body.body[0].content
    var msg = "Successfully pulled content from email: " + message_id;

    // run it through Amazon ML
    var prediction;
    var params = {
      MLModelId: 'ml-m1am1zq4td2',
      PredictEndpoint: 'https://realtime.machinelearning.us-east-1.amazonaws.com', /* required */
      Record: {
        body: body
      }
    };
    machinelearning.predict(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else {
        // Return
        var label = data.Prediction.predictedLabel;
        if (label == 0) {
          prediction = "Not an Amazon Receipt";
        } else {
          prediction = "Amazon Receipt";
        }
        res.status(200).send();
        // Problem: amazon is returning negative for all emails despite content
      }
    });

    // @TODO move it to folder dictated by ML using contextio

  });


  // context wasn't called
  res.status(404);
});

app.post('/a', function (req, res) {
  res.send('POST request to a');
});

app.listen(process.env.PORT || 8080);
