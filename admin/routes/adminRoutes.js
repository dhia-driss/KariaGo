const express = require('express');
const Admin = require('../models/admin');

const router = express.Router();

// ✅ CREATE A NEW ADMIN
router.post('/', async (req, res) => {
    try {
        const newAdmin = new Admin(req.body);
        await newAdmin.save();
        res.status(201).json(newAdmin);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ✅ Debugging the Email Search
router.get('/email', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            console.log("❌ Missing email query parameter.");
            return res.status(400).json({ message: "Email query parameter is required" });
        }

        console.log(`🔍 Searching for admin with email: "${email}"`);

        // ✅ Fix: Explicitly define the query to search by email
        const admin = await Admin.findOne({ email: email }).select('+password');

        if (!admin) {
            console.log("❌ Admin not found.");
            return res.status(404).json({ message: "Admin not found" });
        }

        console.log("✅ Admin Found:", admin);
        res.status(200).json(admin);
    } catch (error) {
        console.error("❌ Error fetching admin:", error);

        // ✅ Debugging: Send back the error
        res.status(500).json({ message: error.message });
    }
});
// ✅ GET ALL ADMINS
router.get('/', async (req, res) => {
    try {
        const admins = await Admin.find();
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ GET ADMIN BY ID
router.get('/:id', async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});




// ✅ UPDATE AN ADMIN
router.put('/:id', async (req, res) => {
    try {
        const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedAdmin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.status(200).json(updatedAdmin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ DELETE AN ADMIN
router.delete('/:id', async (req, res) => {
    try {
        const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);

        if (!deletedAdmin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.status(200).json({ message: 'Administrateur supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
