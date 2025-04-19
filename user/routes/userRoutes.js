const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const User = require('../models/user');
const upload = require("../middleware/upload");

const router = express.Router();

// ✅ SIGNUP with CIN + Permis image upload
router.post('/signup', upload.fields([{ name: "cin" }, { name: "permis" }]), async (req, res) => {
    try {
        const { email, password, num_phone } = req.body;

        if (!req.files?.cin || !req.files?.permis) {
            return res.status(400).json({ message: "CIN and Permis images are required!" });
        }

        const existingUser = await User.findOne({
            $or: [
                { email },
                { cin: req.body.cin },
                { permis: req.body.permis }
            ]
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email, CIN, or Permis." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const cinUrl = `http://${req.hostname}:6004/uploads/${req.files.cin[0].filename}`;
        const permisUrl = `http://${req.hostname}:6004/uploads/${req.files.permis[0].filename}`;

        const newUser = new User({
            email,
            password: hashedPassword,
            num_phone,
            cin: cinUrl,
            permis: permisUrl
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ LOGIN (no token returned anymore)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

        res.status(200).json({ message: "Login successful", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ POST /users (optional user creation)
router.post('/', async (req, res) => {
    try {
        // Remove _id if it exists in the request body
        delete req.body._id;

        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ✅ GET /users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ GET /users/email?email=test@example.com
router.get('/email', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ message: "Email query parameter is required" });

        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ GET /users/:id
router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        const user = await User.findById(req.params.id, { password: 0 });
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ PUT /users/:id
router.put('/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ DELETE /users/:id
router.delete('/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Utilisateur supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
