
const mongoose = require("mongoose");
const Scheme = mongoose.Schema;

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    passwordHash: String,
    img: String,
})

const channelSchema = new mongoose.Schema({
    name: String,
    creatorid: String,
    createdat: {
        type: Date,
        default: Date.now,
    },
    members: [String],
})

const messageSchema = new mongoose.Schema({
    content: String,
    channelid: String,
    senderid: String,
    senderName: String,
    senderAvatar: String,
    timestamp: {
        type: Date,
        default: Date.now,
    },
})
const User = mongoose.model('User', userSchema);
const Channel = mongoose.model('Channel', channelSchema);
const Message = mongoose.model('Message', messageSchema);

module.exports = { User, Channel, Message };