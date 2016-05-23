var request = require("request"), auth = process.env.XBOX_API_AUTH_KEY;
var xboxApi = {};

xboxApi.getConversations = function() {
  var url = "https://xboxapi.com/v2/conversations";
  var conversationData = {};
  var increment = 0;

  request({
    url: url,
    headers: {
      "X-AUTH": auth
    }
  },
  function(error, response, body) {
    var parsedData = JSON.parse(body);

    var senderId = parsedData[increment]["senderXuid"];
    var senderGamerTag = parsedData[increment]["senderGamerTag"];
    var messageText = parsedData[increment]["messageText"];
    var messageCount = parsedData[increment]["messageCount"];

    if (!error) {
      while (parsedData[increment] !== undefined) {
        conversationData[increment] = {
          "senderId": parsedData[increment]["senderXuid"],
          "senderGamerTag": parsedData[increment]["senderGamerTag"],
          "messageText": parsedData[increment]["messageText"],
          "messageCount": parsedData[increment]["messageCount"]
        };
      }
      return conversationData;
    } else {
      return "Sorry, data could not be retrieved";
    }
  });
}

xboxApi.getMostRecentActivity = function(userID) {
  var url = "https://xboxapi.com/v2/" + userID + "/activity"
  request({
    url: url,
    headers: {
      "X-AUTH": auth
    }
  }, function(error, response, body) {
    var parsedData = JSON.parse(body);
    var increment = 0;
    var message = "Jarvis: ";

    try {
      var userID = parsedData["activityItems"][increment]["userXuid"];
      var recentActivityName = parsedData["activityItems"][increment]["contentTitle"];
      var recentActivityDescription = parsedData["activityItems"][increment]["description"];
      var startTime = parsedData["activityItems"][increment]["startTime"];
      var endTime = parsedData["activityItems"][increment]["endTime"];
      var sessionTime = parsedData["activityItems"][increment]["sessionDurationInMinutes"];
      var gamerTag = parsedData["activityItems"][increment]["gamertag"];
    } catch(err) {
      console.log(err);
    }

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

    // An endtime isn't set until the user closes the application they're using.
    // First condition means the user is currently using the app.
    if (startTime !== undefined && endTime === undefined) {
      message += "You are currently using " + recentActivityName + ".";
    } else {
      message += "You used " + recentActivityName + " for " + sessionTime + " minutes.";
    }

    var activityInformation = {
      "id": userID,
      "gamerTag": gamerTag,
      "activityName": recentActivityName,
      "activityDescription": recentActivityDescription,
      "startTime": startTime,
      "endTime": endTime,
      "sessionTime": sessionTime,
      "message": message
    };

    console.log(activityInformation);

    increment = 0;
    return activityInformation;
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

      console.log(userData.gamerTag);
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
  xboxApi.getMostRecentActivity(userID);
}

module.exports = xboxApi;
