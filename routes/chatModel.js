const mongoose = require("mongoose");
const Post = require("./post");
const chatSchema = new mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: {
        content: {
          type: mongoose.Schema.Types.Mixed,
          refPath: "message.messageType",
        },
        messageType: { type: String, enum: ["text", "Post"] },
      },
    },
  },
  { timestamps: true }
);

var Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
