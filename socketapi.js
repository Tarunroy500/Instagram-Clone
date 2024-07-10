const io = require("socket.io")();
const Chat = require("./routes/chatModel");
const User = require("./routes/users");
const socketapi = {
  io: io,
};
var usp = io.of("/user-namespace");
usp.on("connection", async function (socket) {
  console.log("User Connected");
  // console.log(socket.handshake.auth.token);
  var userId = socket.handshake.auth.token;
  await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: "1" } });

  socket.broadcast.emit("getOnlineUser", { user_id: userId });

  socket.on("disconnect", async function () {
    console.log("user Disconnected");

    var userId = socket.handshake.auth.token;
    await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: "0" } });

    socket.broadcast.emit("getOfflineUser", { user_id: userId });
  });

  socket.on("newChat", function (data) {
    socket.broadcast.emit("loadNewChat", data);
  });

 socket.on("existsChat", async function (data) {
   try {
     const chats = await Chat.find({
       $or: [
         { sender_id: data.sender_id, receiver_id: data.receiver_id },
         { sender_id: data.receiver_id, receiver_id: data.sender_id },
       ],
     });

     const populatedChats = await Promise.all(
       chats.map(async (chat) => {
         if (chat.message && chat.message.messageType === "Post") {
           await chat.populate({
             path: "message.content",
             populate: {
               path: "author",
               model: "User",
             },
           });
         }
         return chat;
       })
     );

     console.log(populatedChats);
     socket.emit("loadChats", { chats: populatedChats });
   } catch (error) {
     console.error("Error in existsChat event:", error);
   }
 });
  socket.on('chatDeleted',function(id){
    socket.broadcast.emit('chatMessageDeleted',id);
  })

  
});
module.exports = socketapi;
