var myID = process.env.MY_XBOX_ID;
var express = require("express");
var schedule = require("node-schedule");
var mongoose = require("mongoose")
var xboxApi = require("./middleware/xboxapi");
var app = express();

mongoose.connect("mongodb://localhost/xbox_app", function(err, db) {
  if (!err) {
    console.log("We are connected!");
  }
});

app.set("view engine", "ejs");

//Run the Monitor function every 60 seconds.
setInterval(function() {
  xboxApi.monitorAwayStatus(myID);
}, 15000);

// xboxApi.getMessages(function(response) {
//   console.log(response);
// });

app.get("/", function(req, res) {

});

app.listen(8000, process.env.IP, function() {
  console.log("Server is listening on port: 8000");
});
