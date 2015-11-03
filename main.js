var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:false}));

app.get('/',function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello Node\n');
});

app.post('/', function (req, res) {
  res.send('POST request to the homepage');
});

app.post('/received', function(req, res){
  res.send('POST to received page');
});

app.post('/a', function (req, res) {
  res.send('POST request to a');
});

app.listen(process.env.PORT || 8080);
