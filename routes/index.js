var express = require("express");
const passport = require("passport");
var router = express.Router();
const userSchema = require("./users");
const loacalStrategy = require("passport-local");
const postSchema = require("./post");
const {  GridFsStorage } = require("multer-gridfs-storage");
const commentModel = require("./comments");
const multer = require("multer");
const Chat = require("../routes/chatModel");
const qr = require("qrcode");
const storyModel = require("../routes/story");
const mailer = require("../nodemailer");
const crypto = require("crypto");
const { log } = require("console");
const Notification = require("./notificationModel");
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
    var noti=await Notification.find({userTo:req.user._id}).populate("userTo").populate("userFrom").populate("entityId").sort({CreatedAt: -1})
    console.log(noti);
    res.render("home", { user: user, posts: posts, allUser: allUser,noti:noti });
  } else {
    res.render("login");
  }
});

//notiications
router.get("/notification", isLoggedIn, async (req, res, next) => {
  var noti=await Notification.find({userTo:req.user._id}).populate("userTo").populate("userFrom").sort({CreatedAt: -1})
  console.log(noti);
  res.render("Notification",{noti:noti})
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
  try{
    let user = await userSchema.findOne({ _id: req.params.userid });
    console.log("forgot:user",user);
    if (user.token === req.params.token) {
      res.render("reset", { user });
    } else {
      res.send("Session expired");
    }
  
  }catch(err){
    console.log(err);
  }
 });
// reset route
// router.get("/reset", async (req, res, next) => {
//   res.render("reset");
// });

//reset route

router.post('/reset/:email', async function(req,res){
  var user = await userSchema.findOne({email:req.params.email});
  console.log("user")
  if(user)
  {
    await user.setPassword(req.body.password, async function(err,fuser){
      console.log("after await")

        if(err)
          console.log(err.message);
        else{
          await user.save();
          res.send('password changed')
        }
      }
    )
  }
  
})
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

router.get("/explore",isLoggedIn, async function (req, res, next) {
  const user = await userSchema.findOne({ _id: req.user._id });
  const allUser = await userSchema.find({ _id: { $ne: req.user._id } });
  const posts = await postSchema.find({}).populate("author");
  res.render("explore", { user: user, posts: posts, allUser: allUser });
});


router.get("/profile/:id", isLoggedIn, async function (req, res, next) {
  const followUser = await userSchema.findOne({ _id: req.params.id }).populate("posts");
  const book = await userSchema.findOne({ _id: req.params.id }).populate("bookmarks");
  const user = await userSchema
    .findById(req.params.id)
    .populate("followers posts");
  const loggedInUser = await userSchema.findById(req.user._id);
  res.render("profile", {
    user: user,
    loggedInUser: loggedInUser,
    followUser: followUser,
    book:book,
  });
});
// qr share post

router.get("/shareqr/:id", isLoggedIn, async function (req, res, next) {
  const post = await postSchema.findOne({ _id: req.params.id });
  const qrCodeData = `https://instagramclone-r7mp.onrender.com/singlepost/${post._id}`;
  var qrCode = await qr.toDataURL(qrCodeData)
  res.json({qrCode:qrCode})
});
// chat page

router.get("/chat", isLoggedIn, async function (req, res, next) {
  const user = await userSchema.findOne({ _id: req.user._id });
  const allUser = await userSchema.find({ _id: { $ne: req.user._id } });
  res.render("chat", { user: user, allUser: allUser });
});

// get signup page
router.get("/signup", function (req, res, next) {
  res.render("signup");
});
// reels
router.get("/reels", isLoggedIn, async function (req, res, next) {
  const user = await userSchema.findOne({ _id: req.user._id });
  const allUser = await userSchema.find({ _id: { $ne: req.user._id } });
  const posts = await postSchema.find({}).populate("author");
  res.render("reels", { user: user, posts: posts, allUser: allUser });
});
router.get("/posts", isLoggedIn, async function (req, res, next) {
  const user = await userSchema.findOne({ _id: req.user._id });
  const posts = await postSchema.find({}).populate("author");
  const likesPopulate = await postSchema.find({}).populate("likes");
  res.json({ posts: posts, user: user, likesPopulate: likesPopulate });
});

router.get("/like/:id", isLoggedIn, async function (req, res, next) {
  const post = await postSchema.findOne({ _id: req.params.id });
  if (post.likes.indexOf(req.user._id) == -1) {
    post.likes.push(req.user._id);
    await Notification.insertNotification(post.author,req.user._id,"like",post._id);
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
// followers
router.get("/follow/:id", isLoggedIn, async (req, res) => {
  const followUser = await userSchema.findOne({ _id: req.params.id });
  const loggedInUser = await userSchema.findOne({ _id: req.user._id });
  // console.log(followUser.followers.indexOf(loggedInUser._id));
  if (followUser.followers.indexOf(loggedInUser._id) === -1) {
    followUser.followers.push(loggedInUser._id);
    loggedInUser.following.push(followUser._id);
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
  });
  console.log(user);
  res.json({ user: user });
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
// save chats
router.post("/save-chat", async function (req, res, next) {
  var chat = new Chat({
    sender_id: req.body.sender_id,
    receiver_id: req.body.receiver_id,
    message: req.body.message,
  });
  var newChat = await chat.save();
  res.status(200).send({ success: true, msg: "Chat Inserted", data: newChat });
});
router.post("/delete-chat", async function (req, res, next) {
  await Chat.deleteOne({ _id: req.body.id });
  res.status(200).send({ success: true});
});

// comment
router.post("/comment/:id", isLoggedIn, async (req, res) => {
  const post = await postSchema.findById(req.params.id);
  const { comment } = req.body;
  const cmt = await commentModel.create({
    author: req.user._id,
    comment: comment,
    post: req.params.id,
  });
  post.comments.push(cmt._id);
  await Notification.insertNotification(post.author,req.user._id,"comment",post._id);
  await post.save();
  res.redirect(req.header("referer"));
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
    // Check for existing email
    const existingUser = await userSchema.findOne({ email: req.body.email });

    if (existingUser) {
      // If email already exists, send an alert or handle it as needed
      return res.status(400).json({ message: 'Email already exists' });

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
      res.redirect("/");
    });
  } catch (error) {
    // Handle any registration errors
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
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
