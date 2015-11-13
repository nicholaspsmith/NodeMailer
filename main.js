var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:false}));

var ContextIO = require('contextio');
var ctxCfg = require('./contextConfig');
var ctxioClient = new ContextIO.Client('2.0', {
  key: ctxCfg.key,
  secret: ctxCfg.secret
});


app.get('/',function (req, res) {
  res.send('GET request to homepage');
});

app.post('/', function (req, res) {
  res.send('POST request to the homepage');
});

app.post('/received', function(req, res){
  console.log(req.body);
  // grab message_id
  // var messageId = req.message_data.message_id;
  // res.send('POST to received page ' , req);

  // get content of message
  // https://api.context.io/2.0/accounts/id/messages/message_id

  // run it through Amazon ML

  // move it to folder dictated by ML using contextio

});

app.post('/a', function (req, res) {
  res.send('POST request to a');
});

app.listen(process.env.PORT || 8080);
