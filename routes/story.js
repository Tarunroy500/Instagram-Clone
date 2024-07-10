const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    file: { type: String, required: true },
    filetype: { type: String, required: true },
    caption: { type: String },
    date: { type: Date, default: Date.now },
    time: {
      type: Date,
      default: Date.now,
    },
    views: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { expires: 20 } // Set expires to 20 seconds for TTL
);

const Story = mongoose.model("Story", StorySchema);

module.exports = Story;
