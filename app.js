var express = require("express");

var xboxApi = require("./middleware/xboxapi");
var app = express();

app.set("view engine", "ejs");

xboxApi.monitorAwayStatus("2535413110641408");

app.get("/", function(req, res) {

});

app.listen(8000, process.env.IP, function() {
  console.log("Server is listening on port: 8000");
});
