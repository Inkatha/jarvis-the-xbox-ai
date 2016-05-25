var Message = require("../../models/message");
var database = {};

database.storeNewMessage = function(newMessage, result) {
  Message.find({messageId: newMessage["messageId"]}, function(error, foundMessage) {
      // If no message is found, create a message
      if (foundMessage.length == 0) {
        //Create a new message
        Message.create(newMessage, function(err, newlyCreated) {
          if (err) {
            console.log("There was an error. I'm unable to add the message");
            return result(false);
          } else {
            console.log("I've stored a new message.");
            return result(true);
          }
        });
      } else {
        console.log("I've already created this in the database.");
        return result(false);
      }
  });
}

module.exports = database;
