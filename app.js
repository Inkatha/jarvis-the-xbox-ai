var myID = process.env.MY_XBOX_ID;
var TEST_DATABASE_CONNECTION = process.env.TEST_DATABASE_CONNECTION;
var PRODUCTION_DATABASE_CONNECTION = process.env.PRODUCTION_DATABASE_CONNECTION;

var express = require("express");
var mongoose = require("mongoose");
var http = require("http");
var xboxApi = require("./middleware/xbox-api");
var monitor = require("./middleware/monitor");

var app = express();

mongoose.connect(PRODUCTION_DATABASE_CONNECTION, function(err, db) {
  if (!err) {
    console.log("We are connected!");
  }
});

app.set("view engine", "ejs");

var minutes = 15;
var interval = minutes * 60 * 1000;
setInterval(function() {
  http.get("https://jarvis-the-xbox-ai.herokuapp.com/");
}, interval);

//Run the Monitor function every 60 seconds.
setInterval(function() {
  monitor.awayStatus(myID);
}, 60000);

app.get("/", function(req, res) {
  res.render("index");
});

app.listen(process.env.PORT, process.env.IP, function() {
  console.log("Server is listening on port:", process.env.PORT);
});
