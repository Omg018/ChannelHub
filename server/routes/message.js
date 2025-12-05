
const router = require('express').Router();
const { Message } = require('../models/Schema');

router.post('/send', async (req, res) => {
    const { content, channelId, senderid, senderName, senderAvatar, timestamp } = req.body;
    console.log('Message POST request received:', req.body);

    try {
        const message = new Message({
            content,
            channelid: channelId,
            senderid,
            senderName,
            senderAvatar,
            timestamp: timestamp || Date.now(),
        });

        await message.save();
        console.log('Message saved successfully:', message);
        res.status(201).json({ message: 'Message sent successfully', data: message });
    } catch (err) {
        console.error('Error saving message:', err);
        res.status(500).json({ message: 'Error sending message', error: err.message });
    }
})

router.get('/:channelId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;

        const messages = await Message.find({ channelid: req.params.channelId })
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json(messages.reverse());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:messageId', async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });
        await Message.findByIdAndDelete(req.params.messageId);
        res.json({ message: "Message deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;