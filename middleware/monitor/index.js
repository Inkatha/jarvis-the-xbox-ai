var Message = require("../../models/message");
var database = require("../database-calls/");
var xboxApi = require("../xbox-api/");

var PERSONAL_XBOX_ID = process.env.MY_XBOX_ID;
var PERSONAL_USER_ID = process.env.USER_ID;

var monitor = {};

monitor.awayStatus = function(userID) {
  var FIRST = 0;
  xboxApi.getMostRecentActivity(userID, function(activityInformation) {
    var activityName = activityInformation["activityName"];
    var appUserGamerTag = activityInformation["gamerTag"];

    // If I'm currently watching Hulu or Netflix and I haven't ended the application yet.
    if ((activityName == "Hulu" || activityName == "Netflix") && activityInformation["endTime"] === undefined) {
      xboxApi.getMessages(function(messageData) {
        var newMessage = new Message({});
        var NEWEST = 0;
          // Checks if the XboxAPI returned data
          if (messageData !== undefined) {
            // Loop through all returned messages
              newMessage = new Message({
                messageId: messageData[NEWEST]["header"]["id"],
                senderXuid: messageData[NEWEST]["header"]["senderXuid"],
                sender: messageData[NEWEST]["header"]["sender"],
                sent: messageData[NEWEST]["header"]["sent"],
                expiration: messageData[NEWEST]["header"]["expiration"],
                hasText: messageData[NEWEST]["header"]["hasText"],
                hasPhoto: messageData[NEWEST]["header"]["hasPhoto"],
                hasAudio: messageData[NEWEST]["header"]["hasAudio"],
                messageFolderType: messageData[NEWEST]["header"]["Inbox"],
                messageSummary: messageData[NEWEST]["messageSummary"]
              });

              // Check is the user is attempting to send a message to themselves.
              if (newMessage["sender"] != PERSONAL_USER_ID) {
                // Check if the a message already exists
                  database.storeNewMessage(newMessage, function(response) {
                    if (response === false) {
                      console.log("I've already sent a message to this user.");
                    } else {
                      xboxApi.sendMessage(
                      "Jarvis: Hello " + newMessage["sender"] + ". " +
                      appUserGamerTag + " is currently watching " +
                      activityName + " and is unable to respond. " +
                      appUserGamerTag + " will get to you at their earliest convenience.", newMessage["senderXuid"]);
                    }
                  });
                } else {
                  console.log("I won't store messages you've sent to yourself.");
                }
              }
      });
    } else {
      console.log(appUserGamerTag + " is available to be messaged.");
    }
  });
}

monitor.messWithAFriend = function(userID) {
  var message = "Jarvis: ";
  xboxApi.getUserPresence(userID, function(response) {
    if (response["state"] === "Online") {
      const XBOX_ONE = "XboxOne";
      const NBA_2K = "NBA 2K16";

      var deviceLength = response["devices"].length;
      var titlesLength = 0
      var xboxIndex = 0;

      var xboxDevice = "";
      var activityName = "";

      for (var i = 0; i < deviceLength; i++) {
        if (response["devices"][i]["type"] === XBOX_ONE) {
          xboxDevice = XBOX_ONE;
          titlesLength = response["devices"][i]["titles"].length;
          xboxIndex = i;
        }
      }

      // Check the xbox was found and the user is currently using an app on the xbox
      if (xboxDevice === XBOX_ONE && titlesLength > 0) {
        for (var i = 0; i < titlesLength; i++) {
          if (response["devices"][xboxIndex]["titles"][i]["name"] === NBA_2K) {
            activityName = NBA_2K;
          }
        }
      } else {
        console.log("User is not currently using an xbox");
      }

      if (xboxDevice !== "" && activityName !== "") {
        message += 'I\'ve detected you playing NBA2K and have a message. "Ay Big Fella! Put the sticks down Big Fella. You don\'t want no smoke in ' + activityName + ' Big Fella!"';
        xboxApi.sendMessage(message, userID);
      } else {
        console.log("User is not currently using " + NBA_2K + ".");
      }
    } else {
      console.log("User is currently offline.");
    }
  });
}

module.exports = monitor;
