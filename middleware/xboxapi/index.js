var request = require("request"), auth = process.env.XBOX_API_AUTH_KEY;
var Message = require("../../models/message");
var myID = process.env.MY_XBOX_ID;
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

      // Checks if the XboxAPI returned data
      if (parsedData !== undefined) {

        // Loop through all returned messages
        while (parsedData[increment] !== undefined) {
          // Check if the a message already exists
          Message.find({messageId: parsedData[increment]["header"]["id"]}, function(err, foundMessage) {
            //if (foundMessage === undefined) {

            console.log(parsedData[increment]["header"]["id"]);
            
              var newMessage = new Message({
                messageId: parsedData[increment]["header"]["id"],
                senderXuid: parsedData[increment]["header"]["senderXuid"],
                sender: parsedData[increment]["header"]["sender"],
                sent: parsedData[increment]["header"]["sent"],
                expiration: parsedData[increment]["header"]["expiration"],
                hasText: parsedData[increment]["header"]["hasText"],
                hasPhoto: BooleparsedData[increment]["header"]["hasPhoto"],
                hasAudio: parsedData[increment]["header"]["hasAudio"],
                messageFolderType: parsedData[increment]["header"]["Inbox"],
                messageSummary: parsedData[increment]["messageSummary"]
              });

              // Create the new message
              Message.save(newMessage, function(err, newlyCreated) {
                if (err) {
                  console.log(err);
                } else {
                  console.log("Message successfully saved");
                }
              });
            //}
          });
          increment++;
        }
      }
      if (!error) {
        return queryData(parsedData);
      } else {
        return "Sorry, conversation data could not be retrieved.";
      }
  });
  increment = 0;
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
  xboxApi.getMostRecentActivity(userID, function(activityInformation) {
    var activityName = activityInformation["activityName"];
    var appUserGamerTag = activityInformation["gamerTag"];

    var appStartTime = new Date(activityInformation["startTime"]);
    var appEndTime = new Date(activityInformation["endTime"]);

    if (activityName == "Hulu" || activityName == "Netflix") {
      xboxApi.getMessages(function(messageData) {
        // TODO change to fit all new messages, will be the first conversation you've had.
        var testConversation = messageData[0];

        var msgSenderGamerTag = testConversation["senderGamerTag"];
        var msgSenderID = testConversation["senderXuid"];

        var recentConversationTime = new Date(testConversation["lastUpdated"]);

        // TODO add appEndTime === undefined. Not currently added for testing purposes.
        if (recentConversationTime >= appStartTime) {
          xboxApi.sendMessage(
          "Jarvis: Hello " + msgSenderGamerTag + ". " +
          appUserGamerTag + " is currently watching " +
          activityName + " and is unable to respond. " +
          appUserGamerTag + " will be back to you at their earliest convenience.", myID);
        }
        // End testing
      });
    } else {
      console.log("Signed offline or available for messaging.");
    }
  });
}

module.exports = xboxApi;
