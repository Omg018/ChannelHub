
const router = require('express').Router();
const { Channel, User } = require('../models/Schema');

router.post('/create', async (req, res) => {
    const { name, creatorid } = req.body;
    try {
        const newChannel = new Channel({
            name,
            creatorid,
            members: [creatorid] 
        });
        await newChannel.save();
        res.status(201).json(newChannel);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/all', async (req, res) => {
    try {
        const channels = await Channel.find();
        res.json(channels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/join', async (req, res) => {
    const { channelId, userId } = req.body;
    try {
        const channel = await Channel.findById(channelId);
        if (!channel.members.includes(userId)) {
            channel.members.push(userId);
            await channel.save();
        }
        res.json(channel);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:channelId/members', async (req, res) => {
    try {
        const channel = await Channel.findById(req.params.channelId);
        if (!channel) return res.status(404).json({ message: "Channel not found" });

        const members = await User.find({ _id: { $in: channel.members } }).select('-passwordHash');
        res.json(members);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
