var myID = process.env.MY_XBOX_ID;
var express = require("express");
var schedule = require("node-schedule");
var xboxApi = require("./middleware/xboxapi");
var app = express();

app.set("view engine", "ejs");

// Run the Monitor function every 60 seconds.
setInterval(function() {
  xboxApi.monitorAwayStatus(myID);
}, 60000);

app.get("/", function(req, res) {

});

app.listen(8000, process.env.IP, function() {
  console.log("Server is listening on port: 8000");
});
