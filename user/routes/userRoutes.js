const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user');
const router = express.Router();

// ✅ CREATE USER
router.post('/', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ✅ GET ALL USERS
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ Debugging the Email Search for Users
router.get('/email', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            console.log("❌ Missing email query parameter.");
            return res.status(400).json({ message: "Email query parameter is required" });
        }

        console.log(`🔍 Searching for user with email: "${email}"`);

        // ✅ Fix: Explicitly define the query to search by email
        const user = await User.findOne({ email: email }).select('+password');

        if (!user) {
            console.log("❌ User not found.");
            return res.status(404).json({ message: "User not found" });
        }

        console.log("✅ User Found:", user);
        res.status(200).json(user);
    } catch (error) {
        console.error("❌ Error fetching user:", error);

        // ✅ Debugging: Send back the error
        res.status(500).json({ message: error.message });
    }
});


// ✅ GET USER BY ID (Fixed)
router.get('/:id', async (req, res) => {
    try {
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ UPDATE USER
router.put('/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ DELETE USER
router.delete('/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Utilisateur supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
