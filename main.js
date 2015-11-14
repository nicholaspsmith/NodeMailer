var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded(
  {extended:true}
));
app.use(bodyParser.json());

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
  console.log(req.body.message_id);
  var message_id = req.body.message_id;

  // get content of message
  // https://api.context.io/2.0/accounts/id/messages/message_id
  ctxioClient.accounts(ctxCfg.unsignedn).messages(message_id).get({include_body:1}, function (err, response) {
    if (err) throw err;
    var body = response.body.body[0].content
    var msg = "Successfully pulled content from email: " + message_id;
    res.status(200).send(body);
  });

  res.status(404);
  // run it through Amazon ML

  // move it to folder dictated by ML using contextio

});

app.post('/a', function (req, res) {
  res.send('POST request to a');
});

app.listen(process.env.PORT || 8080);
