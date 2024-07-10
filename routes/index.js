var express = require("express");
const passport = require("passport");
var router = express.Router();
const userSchema = require("./users");
const loacalStrategy = require("passport-local");
const postSchema = require("./post");
const { GridFsStorage } = require("multer-gridfs-storage");
const commentModel = require("./comments");
const multer = require("multer");
const Chat = require("../routes/chatModel");
const qr = require("qrcode");
const storyModel = require("../routes/story");
const mailer = require("../nodemailer");
const crypto = require("crypto");
const Notification = require("./notificationModel");
const clip = require("copy-paste");
// import clipboardy from "clipboardy"
// passport email setup
passport.use(
  new loacalStrategy(
    { usernameField: "email", passwordField: "password" },
    userSchema.authenticate()
  )
);

// multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + file.originalname);
  },
});

// filter images and vedios while upload

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/avif",
      "image/jpg",
      "image/png",
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      return cb(null, true);
    } else {
      return cb(false);
    }
  },
});

/* GET login page. */
router.get("/", async function (req, res, next) {
  if (req.user) {
    const user = await userSchema.findOne({ _id: req.user._id });
    const allUser = await userSchema.find({ _id: { $ne: req.user._id } });
    const posts = await postSchema.find({}).populate("author");
    var noti = await Notification.find({ userTo: req.user._id })
      .populate("userTo")
      .populate("userFrom")
      .sort({ CreatedAt: -1 });
    // console.log(noti);
    res.render("home", {
      user: user,
      posts: posts,
      allUser: allUser,
      noti: noti,
    });
  } else {
    res.render("login");
  }
});

//notiications
router.get("/notification", isLoggedIn, async (req, res, next) => {
  var noti = await Notification.find({ userTo: req.user._id })
    .populate("userTo")
    .populate("userFrom")
    .sort({ CreatedAt: -1 });
  console.log(noti);
  res.render("Notification", { noti: noti });
});
// bookmarks

router.get("/bookmark-post/:id", isLoggedIn, async function (req, res, next) {
  const user = await userSchema.findOne({ _id: req.user._id });
  if (user.bookmarks.includes(req.params.id)) {
    user.bookmarks.pull(req.params.id);
  } else {
    user.bookmarks.push(req.params.id);
  }
  await user.save();
  res.json({ user: user });
});

// search
router.get("/username/:name", isLoggedIn, async function (req, res, next) {
  // console.log(req.params.name);
  const foundUser = await userSchema.find({
    fullName: { $regex: req.params.name, $options: "i" },
  });
  // console.log(foundUser);
  res.json({ foundUser: foundUser });
});
// cpy link
router.get("/cpy-link/:postId", isLoggedIn, async function (req, res, next) {
  var linkToCopy = `http://localhost:3000/singlepost/${req.params.postId}`;
  clip.copy(linkToCopy);
  res.json({ success: true });
});
// single post
router.get("/singlepost/:id", isLoggedIn, async function (req, res, next) {
  const post = await postSchema.findOne({ _id: req.params.id }).populate([
    { path: "author", model: "User" },
    {
      path: "comments",
      model: "Comment",
      populate: { path: "author", model: "User" },
    },
  ]);
  const user = await userSchema.findOne({ _id: req.user._id });
  console.log(post);
  res.render("singlePost", { post: post, user: user });
});
// route for share post to chat with sender id and receiver id append msg to chat
// forgot get route
router.get("/forgot", function (req, res, next) {
  res.render("forgetPassword");
});
// update profile
router.get("/getloggedInUser", async function (req, res, next) {
  const user = await userSchema.findOne({ _id: req.user._id });
  res.json({ loggedInUser: user });
});

// delete route
router.get("/deletepost/:id", async function (req, res, next) {
  const user = await userSchema.findOne({
    _id: req.user._id,
  });
  var index = user.posts.indexOf(req.params.id);
  user.posts.splice(index, 1);
  await user.save();
  await postSchema.findByIdAndDelete(req.params.id);
  res.json({
    success: true,
    message: "post deleted",
  });
});

router.post("/forgot", async (req, res, next) => {
  var user = await userSchema.findOne({
    email: req.body.email,
  });
  console.log(user);
  if (!user) {
    res.send("we've send a mail, if user exists...");
  } else {
    crypto.randomBytes(80, async (err, buff) => {
      let token = buff.toString("hex");
      user.token = token;
      await user.save();
      mailer(req.body.email, user._id, token).then((err) => {
        console.log(err);
        res.send("mail sent");
      });
    });
  }
});
router.get("/forgot/:userid/:token", async (req, res, next) => {
  let user = await userSchema.findOne({ _id: req.params.userid });
  if (user.token === req.params.token) {
    res.render("reset", { user });
  } else {
    res.send("Session expired");
  }
});
// reset route
// router.get("/reset", async (req, res, next) => {
//   res.render("reset");
// });

//reset route

router.post("/reset/:email", async function (req, res) {
  var user = await userSchema.findOne({ email: req.params.email });
  if (user) {
    await user.setPassword(req.body.password, async function (err, fuser) {
      if (err) console.log(err);
      else {
        await user.save();
        res.send("password changed");
      }
    });
  }
});
// router.post("/reset/:userid", async function (req, res, next) {
//   try {
//     const user = await userSchema.findOne({ _id: req.params.userid });

//     if (!user) {
//       return res.status(404).send("User not found");
//     }

//     const newPassword = req.body.password;

//     // Validate newPassword and handle potential errors
//     if (!newPassword) {
//       return res.status(400).send("Password is required");
//     }

//     await user.setPassword(newPassword);

//     user.token = "";

//     // Save the user and handle potential errors
//     try {
//       await user.save();
//     } catch (saveError) {
//       console.error("Error saving user:", saveError);
//       return res.status(500).send("Error saving user");
//     }

//     // Log in the user and handle potential errors
//     req.logIn(user, function (loginErr) {
//       if (loginErr) {
//         console.error("Error logging in user:", loginErr);
//         return res.status(500).send("Error while logging in");
//       }

//       res.redirect("/");
//     });
//   } catch (error) {
//     console.error("An error occurred:", error);
//     res.status(500).send("An error occurred");
//   }
// });

router.get("/explore", isLoggedIn, async function (req, res, next) {
  const user = await userSchema.findOne({ _id: req.user._id });
  const allUser = await userSchema.find({ _id: { $ne: req.user._id } });
  const posts = await postSchema.find({}).populate("author");
  res.render("explore", { user: user, posts: posts, allUser: allUser });
});

router.get("/profile/:id", isLoggedIn, async function (req, res, next) {
  const followUser = await userSchema
    .findOne({ _id: req.params.id })
    .populate("posts");
  const book = await userSchema
    .findOne({ _id: req.params.id })
    .populate("bookmarks");
  const user = await userSchema
    .findById(req.params.id)
    .populate("followers posts")
    .populate("following");
  const loggedInUser = await userSchema.findById(req.user._id);
  res.render("profile", {
    user: user,
    loggedInUser: loggedInUser,
    followUser: followUser,
    book: book,
  });
});
// qr share post

router.get("/shareqr/:id", isLoggedIn, async function (req, res, next) {
  const post = await postSchema.findOne({ _id: req.params.id });
  const qrCodeData = `https://pictogram-2ebi.onrender.com/singlepost/${post._id}`;
  var qrCode = await qr.toDataURL(qrCodeData);
  res.json({ qrCode: qrCode });
});
// chat page

router.get("/chat", isLoggedIn, async function (req, res, next) {
  const user = await userSchema.findOne({ _id: req.user._id });
  const allUser = await userSchema.find({ _id: { $ne: req.user._id } });
  res.render("chat", { user: user, allUser: allUser, isProfile: false });
});

// get signup page
router.get("/signup", function (req, res, next) {
  res.render("signup");
});
// reels
router.get("/reels", isLoggedIn, async function (req, res, next) {
  const user = await userSchema.findOne({ _id: req.user._id });
  const allUser = await userSchema.find({ _id: { $ne: req.user._id } });
  var noti = await Notification.find({ userTo: req.user._id })
    .populate("userTo")
    .populate("userFrom")
    .sort({ CreatedAt: -1 });
  const posts = await postSchema.find({}).populate("author");
  res.render("reels", {
    user: user,
    posts: posts,
    allUser: allUser,
    noti: noti,
  });
});
router.get("/posts", isLoggedIn, async function (req, res, next) {
  const user = await userSchema.findOne({ _id: req.user._id });
  const posts = await postSchema.find({}).populate("author");
  console.log(user, "user");
  console.log(posts, "post");
  const likesPopulate = await postSchema.find({}).populate("likes");
  res.json({ posts: posts, user: user, likesPopulate: likesPopulate });
});

router.get("/like/:id", isLoggedIn, async function (req, res, next) {
  const post = await postSchema.findOne({ _id: req.params.id });
  if (post.likes.indexOf(req.user._id) == -1) {
    post.likes.push(req.user._id);
    await Notification.insertNotification(
      post.author,
      req.user._id,
      "like",
      post._id
    );
  } else {
    post.likes.splice(post.likes.indexOf(req.user._id), 1);
  }
  await post.save();
  res.json({ success: true, post: post });
});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.get("/post/:id", isLoggedIn, async (req, res) => {
  const singlePost = await postSchema.findOne({ _id: req.params.id }).populate({
    path: "author",
    model: "User",
  });
  const user = await userSchema.findOne({ _id: req.user._id });
  const post = await postSchema.findOne({ _id: req.params.id }).populate([
    { path: "author", model: "User" },
    {
      path: "comments",
      model: "Comment",
      populate: { path: "author", model: "User" },
    },
  ]);
  res.json({ post: post, user: user, singlePost: singlePost });
});
// remove followers
router.get("/remove-follow/:id", isLoggedIn, async (req, res) => {
  const followerRemove = req.params.id;
  const loggedInUser = await userSchema.findOne({ _id: req.user._id });
  try {
    await userSchema.findByIdAndUpdate(loggedInUser._id, {
      $pull: {
        followers: followerRemove,
      },
    });
    await userSchema.findByIdAndUpdate(followerRemove, {
      $pull: {
        following: loggedInUser._id,
      },
    });
    res.redirect(req.header("referer"));
  } catch (error) {
    console.log(error)
  }
});
// follow Unfollow
router.get("/follow/:id", isLoggedIn, async (req, res) => {
  const followUser = await userSchema.findOne({ _id: req.params.id });
  const loggedInUser = await userSchema.findOne({ _id: req.user._id });
  // console.log(followUser.followers.indexOf(loggedInUser._id));
  if (followUser.followers.indexOf(loggedInUser._id) === -1) {
    followUser.followers.push(loggedInUser._id);
    loggedInUser.following.push(followUser._id);
    await Notification.insertNotification(
      followUser._id,
      req.user._id,
      "follow",
      followUser._id
    );
  } else {
    followUser.followers.splice(
      followUser.followers.indexOf(loggedInUser._id),
      1
    );
    loggedInUser.following.splice(
      loggedInUser.following.indexOf(followUser._id),
      1
    );
  }
  await loggedInUser.save();
  await followUser.save();
  res.redirect(req.header("referer"));
});
// get story
router.get("/story", isLoggedIn, async (req, res, next) => {
  const user = await userSchema.findById(req.user._id).populate([
    {
      path: "followers",
      populate: {
        path: "stories",
      },
    },
    {
      path: "stories",
    },
  ]);
  res.json({ followers: user.followers, user: user });
});

// get single story
router.get("/story/:id", isLoggedIn, async (req, res) => {
  const user = await userSchema.findById(req.params.id).populate({
    path: "stories",
    populate: {
      path: "views",
    },
  });
  // console.log(user);
  res.json({ user: user });
});
// deleteStory
router.get("/deletestory/:id", isLoggedIn, async (req, res, next) => {
  const user = await userSchema.findById(req.user._id);
  await storyModel.findByIdAndDelete(req.params.id);
  user.stories.pull(req.params.id);
  await user.save();
  res.redirect("/");
});
// story views
router.get("/viewstory/:id", isLoggedIn, async (req, res) => {
  const story = await storyModel.findById(req.params.id);
  if (story.views.includes(req.user._id)) return res.json({ story: story });
  if (story.author.toString() !== req.user._id.toString()) {
    story.views.push(req.user._id);
    await story.save();
  }
  res.json({ story: story });
});
// deletecomment
router.get("/deletecomment/:postid/:cmtid", isLoggedIn, async (req, res) => {
  const post = await postSchema.findById(req.params.postid);
  var index = post.comments.indexOf(req.params.cmtid);
  post.comments.splice(index, 1);
  await post.save();
  await commentModel.findByIdAndDelete(req.params.cmtid);
  res.redirect(req.header("referer"));
});
// goto chat via profile
router.get("/gotochat/:id", isLoggedIn, async (req, res, next) => {
  const user = await userSchema.findOne({ _id: req.user._id });
  const allUser = await userSchema.find({ _id: { $ne: req.user._id } });
  res.render("chat", {
    isProfile: true,
    receiveViaProfile: req.params.id,
    user: user,
    allUser: allUser,
  });
});
router.get("/getSender/:id/:rec", isLoggedIn, async function (req, res, next) {
  const sender = await userSchema.findById(req.params.id);
  const rec = await userSchema.findById(req.params.rec);
  res.json({ sender: sender, rec: rec });
});
// block user
router.get("/block/:userId", async function (req, res, next) {
  try {
    const currentUser = await userSchema.findById(req.user._id);
    const userToBlockOrUnblock = await userSchema.findById(req.params.userId);
    if (!currentUser || !userToBlockOrUnblock) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }
    if (currentUser._id.toString() === userToBlockOrUnblock._id.toString()) {
      return res.status(400).json({
        success: false,
        msg: "You can't block or unblock yourself.",
      });
    }
    const isUserBlocked = currentUser.blockedUsers.includes(
      userToBlockOrUnblock._id
    );
    if (isUserBlocked) {
      currentUser.blockedUsers = currentUser.blockedUsers.filter(
        (userId) => userId.toString() !== userToBlockOrUnblock._id.toString()
      );
      currentUser.following = currentUser.following.filter(
        (userId) => userId.toString() !== userToBlockOrUnblock._id.toString()
      );
      userToBlockOrUnblock.followers = userToBlockOrUnblock.followers.filter(
        (userId) => userId.toString() !== currentUser._id.toString()
      );
      await Promise.all([currentUser.save(), userToBlockOrUnblock.save()]);
      res.redirect("back");
    } else {
      currentUser.blockedUsers.push(userToBlockOrUnblock._id);
      currentUser.following = currentUser.following.filter(
        (userId) => userId.toString() !== userToBlockOrUnblock._id.toString()
      );
      userToBlockOrUnblock.followers = userToBlockOrUnblock.followers.filter(
        (userId) => userId.toString() !== currentUser._id.toString()
      );
      await Promise.all([currentUser.save(), userToBlockOrUnblock.save()]);
      res.redirect("back");
    }
  } catch (error) {
    console.error("Error blocking/unblocking/unfollowing user:", error);
    res.status(500).json({
      success: false,
      msg: "Error blocking/unblocking/unfollowing user",
      error: error.message,
    });
  }
});
// save chats
router.post("/save-chat", async function (req, res, next) {
  console.log("save-chat", req.body);
  try {
    const sender = await userSchema.findById(req.body.sender_id);
    const receiver = await userSchema.findById(req.body.receiver_id);

    if (!sender || !receiver) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }
    if (sender.blockedUsers.includes(receiver._id)) {
      return res
        .status(403)
        .json({ success: false, msg: "You Blocked This Contact" });
    }

    if (receiver.blockedUsers.includes(sender._id)) {
      return res
        .status(403)
        .json({ success: false, msg: "You are blocked by the receiver" });
    }
    var chat = new Chat({
      sender_id: req.body.sender_id,
      receiver_id: req.body.receiver_id,
      message: {
        content: req.body.message.content,
        messageType: req.body.message.messageType, // Use the updated property name
      },
    });

    // console.log("chat", chat);

    var newChat = await chat.save();
    res
      .status(200)
      .json({ success: true, msg: "Chat Inserted", data: newChat });
  } catch (error) {
    console.error("Error saving chat:", error);
    res
      .status(500)
      .json({ success: false, msg: "Error saving chat", error: error.message });
  }
});
//share chat to post
router.get(
  "/share-chat-msg/:receiver_id/:postId",
  async function (req, res, next) {
    try {
      var chat = new Chat({
        sender_id: req.user._id,
        receiver_id: req.params.receiver_id,
        message: {
          content: req.params.postId,
          messageType: "Post",
        },
      });

      console.log("chat", chat);

      var newChat = await chat.save();

      var populatedChat = await Chat.findById(newChat._id).populate(
        "receiver_id"
      );

      res
        .status(200)
        .json({ success: true, msg: "Chat Inserted", data: populatedChat });
    } catch (error) {
      console.error("Error saving chat:", error);
      res.status(500).json({
        success: false,
        msg: "Error saving chat",
        error: error.message,
      });
    }
  }
);
// delete chat
router.post("/delete-chat", async function (req, res, next) {
  await Chat.deleteOne({ _id: req.body.id });
  res.status(200).send({ success: true });
});

// comment
router.post("/comment/:id", isLoggedIn, async (req, res) => {
  try {
    const post = await postSchema.findById(req.params.id);
    const { comment } = req.body;
    const cmt = await commentModel.create({
      author: req.user._id,
      comment: comment,
      post: req.params.id,
    });
    post.comments.push(cmt._id);
    await Notification.insertNotification(
      post.author,
      req.user._id,
      "comment",
      post._id
    );
    await post.save();
    res.status(200).send({ success: true });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
});
//upload story
router.post(
  "/uploadstory",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ err: "file not found" });
    const user = await userSchema.findById(req.user._id);
    const story = new storyModel({
      author: req.user._id,
      file: `${req?.file?.filename}`,
      filetype: req?.file?.mimetype.split("/")[0].trim(),
    });
    user.stories.push(story._id);
    await user.save();
    await story.save();
    res.redirect("/");
  }
);
// upload profile picture
router.post(
  "/uploadprofile",
  upload.single("profilePhoto"),
  isLoggedIn,
  async (req, res, next) => {
    const user = await userSchema.findOne({ _id: req.user._id });
    user.profile_picture = `../uploads/${req.file.filename}`;
    await user.save();
    res.json({ message: "success upload profile", user: user });
  }
);

// update profile
router.post("/save-edit", isLoggedIn, async function (req, res, next) {
  await userSchema.findByIdAndUpdate(
    { _id: req.user._id },
    {
      fullName: req.body.fullName,
      bio: req.body.bio,
      links: req.body.links,
      birthdate: req.body.birthdate,
      gender: req.body.gender,
    }
  );
  const user = await userSchema.findById(req.user._id);
  // console.log(user);
  res.send({ message: "success", user: user });
});

// upload post
router.post(
  "/uploadpost",
  upload.single("file"),
  isLoggedIn,
  async (req, res, next) => {
    try {
      const post = await postSchema.create({
        author: req.user._id,
        title: req.body.title,
        file: `../uploads/${req?.file?.filename}`,
        filetype: req?.file?.mimetype.split("/")[0],
        date: Date.now(),
      });
      const user = await userSchema.findById(req.user._id);
      user.posts.push(post._id);
      await user.save();
      res.redirect("/");
    } catch (err) {
      res.send(new Error(err));
    }
  }
);

// login
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  }),
  function (req, res, next) {}
);

// register
// Assuming your user model is defined in a separate file
router.post("/register", async function (req, res, next) {
  try {
    if (
      !req.body.email ||
      !req.body.password ||
      !req.body.number ||
      !req.body.fullName
    ) {
      res.json({ message: "All fields are required" });
      return;
    }
    // Check for existing email
    const existingUser = await userSchema.findOne({ email: req.body.email });

    if (existingUser) {
      // console.log("Email already exists");
      // If email already exists, send an alert or handle it as needed
      res.json({ message: "Email already exists" });
      return;
    }

    // If the email is unique, proceed with user registration
    const newUser = new userSchema({
      email: req.body.email,
      number: req.body.number,
      fullName: req.body.fullName,
    });

    // Assuming you are using a library like Passport to handle registration
    await userSchema.register(newUser, req.body.password);

    passport.authenticate("local")(req, res, function () {
      res.json({ message: "success" });
      return;
    });
  } catch (error) {
    // Handle any registration errors
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});
// check login
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
}
// function checkedLoggedin(req, res, next) {

// }

module.exports = router;
