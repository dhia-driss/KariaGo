const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const router = express.Router();
router.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "15m";
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || "7d";

const ADMIN_SERVICE = "http://localhost:6000/admins"; // Admin Microservice
const USER_SERVICE = "http://localhost:6004/users";  


// 🔐 Generate JWT Access Token
const generateAccessToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

// 🔄 Generate JWT Refresh Token
const generateRefreshToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRATION });
};


// ✅ User Login Route
router.post('/user/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await authenticateUser(email, password);

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'Strict' });
        res.json({ accessToken });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});

async function authenticateUser(email, password) {
    try {
        console.log("🔍 Checking User Login:", email);
        
        // ✅ Debugging: Log the request being sent
        console.log(`📡 Sending request to: ${USER_SERVICE}?email=${email}`);

        const response = await axios.get(`${USER_SERVICE}?email=${email}`);
        console.log("✅ User Microservice Response:", response.data);

        // ✅ Fix: Extract the first user if the response is an array
        let user = response.data;
        if (Array.isArray(user)) {
            if (user.length === 0) {
                console.log("❌ User not found in the array!");
                throw new Error("User not found");
            }
            user = user[0]; // Take the first user from the array
        }

        if (!user || !user.password) {
            console.log("❌ User not found or missing password field.");
            throw new Error("User not found");
        }

        console.log("🔐 Hashed Password in DB:", user.password);
        console.log("🔑 Entered Password:", password);

        // Validate password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("❌ Password mismatch!");
            throw new Error("Invalid credentials");
        }

        console.log("✅ User authentication successful!");
        return user;
    } catch (error) {
        console.error("❌ User Authentication Error:", error.message);
        throw new Error("User authentication failed");
    }
}

// ✅ Fixed User Login Route
router.post('/user/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`🔍 Attempting User Login: ${email}`);

        const user = await authenticateUser(email, password);

        // Generate JWT tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'Strict' });
        res.json({ accessToken });

    } catch (error) {
        console.error("❌ User Login Error:", error.message);
        res.status(401).json({ message: error.message });
    }
});




async function authenticateAdmin(email, password) {
    try {
        console.log("🔍 Checking Admin Login:", email);
        const response = await axios.get(`${ADMIN_SERVICE}?email=${email}`);
        console.log("✅ Admin Response:", response.data);

        // Extract the first admin from the array
        const admin = response.data[0]; 

        if (!admin || !admin.password) {
            console.log("❌ Admin not found!");
            throw new Error("Admin not found");
        }

        console.log("🔐 Hashed Password in DB:", admin.password);
        console.log("🔑 Entered Password:", password);

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            console.log("❌ Password mismatch!");
            throw new Error("Invalid credentials");
        }

        return admin;
    } catch (error) {
        console.error("❌ Admin Authentication Error:", error.message);
        throw new Error("Admin authentication failed");
    }
}


// ✅ Admin Login Route
router.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await authenticateAdmin(email, password);

        const accessToken = generateAccessToken(admin);
        const refreshToken = generateRefreshToken(admin);

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, sameSite: 'Strict' });
        res.json({ accessToken });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});



// 🔄 Refresh Token Route
router.post('/refresh', (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(403).json({ message: "Refresh Token Required" });

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid Refresh Token" });

        const accessToken = generateAccessToken(user);
        res.json({ accessToken });
    });
});

// ❌ Logout (Invalidate Refresh Token)
router.post('/logout', (req, res) => {
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict' });
    res.json({ message: "Logged out successfully" });
});

// ✅ Protected Route (Requires Token)
router.get('/protected', verifyToken, (req, res) => {
    res.json({ message: "Access granted!", user: req.user });
});

// 🔍 Middleware to Verify JWT Token
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "Token required" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Invalid token" });
        req.user = decoded;
        next();
    });
}

module.exports = { authRouter: router, verifyToken };
