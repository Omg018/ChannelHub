const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require('bcrypt');

const { User } = require('../models/Schema');

const jwt = require('jsonwebtoken');


router.post("/signup", async (req, res) => {
    const { username, email, password, img } = req.body;
    console.log("Signup Request:", username, email);

    try {
        let user = await User.findOne({ email: email });

        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedpassword = await bcrypt.hash(password, 10);

        user = await User.create({ username, email, passwordHash: hashedpassword, img });

        if (!user) {
            return res.status(400).json({ message: "User not created" })
        }
        await user.save();


        console.log("User saved successfully:", user.email);

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({
                    message: "User created successfully",
                    token,
                    user: { username: user.username, email: user.email, img: user.img }
                });
            }
        );

    }
    catch (err) {
        console.error("Error saving user:", err);
        return res.status(500).json({
            message: "Error in Saving",
            error: err.message
        });
    }
});

router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    console.log("Signin Request:", email);
    try {
        let user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        if (!user.passwordHash) {
            return res.status(400).json({ message: "User data invalid. Please sign up again." });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.status(200).json({
                    message: "Signin Successful",
                    token,
                    user: { username: user.username, email: user.email, img: user.img }
                });
            }
        );


    } catch (err) {
        console.error("Error in Signin:", err);
        return res.status(500).json({ message: "Error in Signin", error: err.message })
    }
})

router.get("/verify", async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.user.id).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);

    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
});

module.exports = router;