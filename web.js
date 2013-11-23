var express = require('express');
var util = require('util');

var mu = require('mu2');
mu.root = __dirname + '/templates';

var app = express.createServer(express.logger());
app.use("/", express.static(__dirname + "/static"));

app.get('/', function(request, response) {
	var stream = mu.compileAndRender('index.html');
    util.pump(stream, response);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log('Listening on port ' + port);
});
