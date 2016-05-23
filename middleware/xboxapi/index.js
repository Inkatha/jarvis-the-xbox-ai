var request = require("request"), auth = process.env.XBOX_API_AUTH_KEY;
var Message = require("../../models/message");
var PERSONAL_XBOX_ID = process.env.MY_XBOX_ID;
var PERSONAL_USER_ID = process.env.USER_ID;
var xboxApi = {};

xboxApi.getConversations = function(queryData) {
  var url = "https://xboxapi.com/v2/conversations";

  request({
    url: url,
    headers: {
      "X-AUTH": auth
    }
  },
  function(error, response, body) {
    var parsedData = JSON.parse(body);
    if (!error) {
      return queryData(parsedData);
    } else {
      return "Sorry, conversation data could not be retrieved.";
    }
  });
}

xboxApi.getMessages = function(queryData) {
  var url = "https://xboxapi.com/v2/messages";
  var increment = 0;

  request({
    url: url,
    headers: {
      "X-AUTH": auth
    }
  },

  function(error, response, body) {
    var parsedData = JSON.parse(body);
        if (!error) {
          return queryData(parsedData);
        } else {
          return undefined;
        }
  });
}

xboxApi.getMostRecentActivity = function(userID, queryData) {
  var url = "https://xboxapi.com/v2/" + userID + "/activity";
  var activityInformation = {};
  request({
    url: url,
    headers: {
      "X-AUTH": auth
    }
  }, function(error, response, body) {
    var parsedData = JSON.parse(body);
    var increment = 0;
    var message = "Jarvis: ";

    if (!error) {
      var userID = parsedData["activityItems"][increment]["userXuid"];
      var recentActivityName = parsedData["activityItems"][increment]["contentTitle"];
      var recentActivityDescription = parsedData["activityItems"][increment]["description"];
      var startTime = parsedData["activityItems"][increment]["startTime"];
      var endTime = parsedData["activityItems"][increment]["endTime"];
      var sessionTime = parsedData["activityItems"][increment]["sessionDurationInMinutes"];
      var gamerTag = parsedData["activityItems"][increment]["gamertag"];


      // This check is done to skip over activities without a start time and end time, example: achievements.
      while (startTime === undefined) {
        userID = parsedData["activityItems"][increment]["userXuid"];
        gamerTag = parsedData["activityItems"][increment]["gamertag"];
        recentActivityName = parsedData["activityItems"][increment]["contentTitle"];
        recentActivityDescription = parsedData["activityItems"][increment]["description"];
        startTime = parsedData["activityItems"][increment]["startTime"];
        endTime = parsedData["activityItems"][increment]["endTime"];
        sessionTime = parsedData["activityItems"][increment]["sessionDurationInMinutes"];
        increment++;
      }
    }

    // An endtime isn't set until the user closes the application they're using.
    // First condition means the user is currently using the app.
    if (startTime !== undefined && endTime === undefined) {
      message += "You are currently using " + recentActivityName + ".";
    } else {
      message += "You used " + recentActivityName + " for " + sessionTime + " minutes.";
    }

    activityInformation = {
      "id": userID,
      "gamerTag": gamerTag,
      "activityName": recentActivityName,
      "activityDescription": recentActivityDescription,
      "startTime": startTime,
      "endTime": endTime,
      "sessionTime": sessionTime,
      "message": message
    };

    increment = 0;
    return queryData(activityInformation);
  });
}

xboxApi.getUserData = function(userID) {
  var url = "https://xboxapi.com/v2/" + userID + "/profile"
  var userData = {};
  request({
    url: url,
    headers: {
      "X-AUTH": auth
    }
  }, function(error, response, body) {
    var parsedData = JSON.parse(body);


    if (!error) {
      var gamerTag = parsedData["Gamertag"];
      var gamerScore = parsedData["Gamerscore"];
      var accountTier = parsedData["AccountTier"];
      var reputation = parsedData["XboxOneRep"];
      var tenureLevel = parsedData["TenureLevel"];
      var message = "Jarvis: Hello " + gamerTag + ". After some searching I found some information! Your Gamerscore is " + gamerScore + ". You are a " + accountTier + " Member. You're considered a " + reputation + " by Microsoft, and Your account has been active for " + tenureLevel + " Years.";

      userData = {
        "gamerTag": gamerTag,
        "gamerScore": gamerScore,
        "accountTier": accountTier,
        "reputation": reputation,
        "tenureLevel": tenureLevel,
        "message": message
      }
      return userData;
    } else {
      console.log("There was an error");
      return null;
    }
  });
}

xboxApi.sendMessage = function(message, userID) {
  var url = "https://xboxapi.com/v2/messages"
  request({
    url: url,
    headers: {
      "X-AUTH": auth
    },
    method: "POST",
    json: {
        "to": [userID],
        "message": message
    }
  }, function(error) {
    if (!error) {
      console.log("A Message has been sent.");
    } else {
      console.log("Invalid authorization... unable to send a message.");
    }
  });
}

xboxApi.monitorAwayStatus = function(userID) {
  var FIRST = 0;
  xboxApi.getMostRecentActivity(userID, function(activityInformation) {
    var activityName = activityInformation["activityName"];
    var appUserGamerTag = activityInformation["gamerTag"];

    // If I'm currently watching Hulu or Netflix and I haven't ended the application yet.
    console.log(activityInformation["endTime"]);
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
                  xboxApi.storeNewMessage(newMessage, function(response) {
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
      console.log("Signed offline, or available for messaging.");
    }
  });
}

xboxApi.storeNewMessage = function(newMessage, result) {
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



module.exports = xboxApi;
