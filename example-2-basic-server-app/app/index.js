const express = require('express');
const app = express();
const ip = require('ip');

app.get('/', function (req, res) {
  res.send(`Hello World from ${ip.address()}`);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000 !')
});
