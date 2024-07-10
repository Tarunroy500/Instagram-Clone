const mongoose = require("mongoose");

const NotificationModel =  mongoose.Schema({
    userTo:{type: mongoose.Schema.Types.ObjectId,ref: "User",},
    userFrom:{type: mongoose.Schema.Types.ObjectId,ref: "User",},
    notificationType:String,
    opened:{type:Boolean,default:false},
    entityId:{type:
        mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60*60*24,
      },
      time: {
        type: Date,
        default: Date.now
    }
});

NotificationModel.statics.insertNotification = async (userTo,userFrom,notificationType,entityId)=>{
    var data ={
        userTo:userTo,
        userFrom:userFrom,
        notificationType:notificationType,
        entityId:entityId
    }
    await Notification.deleteOne(data)
    return Notification.create(data);

}
var Notification=  mongoose.model("Notification", NotificationModel);
module.exports =Notification
