var myID = process.env.MY_XBOX_ID;
var LOCAL_DATABASE_CONNECTION = "mongodb://localhost/xbox_app";
var PRODUCTION_DATABASE_CONNECTION = process.env.PRODUCTION_DATABASE_CONNECTION;

var express = require("express");
var schedule = require("node-schedule");
var mongoose = require("mongoose");

var xboxApi = require("./middleware/xbox-api");
var monitor = require("./middleware/monitor");

var app = express();

mongoose.connect(PRODUCTION_DATABASE_CONNECTION, function(err, db) {
  if (!err) {
    console.log("We are connected!");
  }
});

app.set("view engine", "ejs");

//Run the Monitor function every 60 seconds.
setInterval(function() {
  monitor.awayStatus(myID);
}, 60000);

// setInterval(function() {
// monitor.messWithAFriend("2533274850459263");
// }, 15000);

app.get("/", function(req, res) {

});

app.listen(8000, process.env.IP, function() {
  console.log("Server is listening on port: 8000");
});
