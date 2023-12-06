// var express = require('express');
// var router = express.Router();
var mongoose = require("mongoose")
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/insta")

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  // last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  number: { type: Number, required: true },
  // password: String,
  profile_picture: {
    type: String,
    default:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png",
  },
  bio: {
    type: String,
    default: "I am new to Instagram",
  },
  stories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
    },
  ],
  // location: String,
  birthdate: String,
  gender: String,
  // friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  // friend_requests_sent: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  // friend_requests_received: [
  //   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  // ],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  is_online: {
    type: String,
    default: "0",
  },
  links: { default: "", type: String },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  token : String,
  // blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  // reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});


userSchema.plugin(plm,{ usernameField: "email" });
const user = mongoose.model("User", userSchema);

module.exports = user;
