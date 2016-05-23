var mongoose = require("mongoose");

var messageSchema = new mongoose.Schema({
  messageId: String,
  senderXuid: String,
  sender: String,
  sent: String,
  expiration: String,
  hasText: Boolean,
  hasPhoto: Boolean,
  hasAudio: Boolean,
  messageFolderType: String,
  messageSummary: String
});

module.exports = mongoose.model("Message", messageSchema);
