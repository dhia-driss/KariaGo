const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const Reclamation = require('../models/reclamation');

const router = express.Router();

// ✅ DEBUG MODELS ENDPOINT
router.get('/debug/models', async (req, res) => {
    return res.status(200).json({
        available_models: mongoose.modelNames()
    });
});

// ✅ CREATE A NEW RECLAMATION (Check if User Exists)
router.post('/', async (req, res) => {
    try {
        const { id_user, message } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id_user)) {
            return res.status(400).json({ message: "Invalid id_user format" });
        }

        // ✅ Check if User Exists via Axios (Calling User Microservice)
        const userResponse = await axios.get(`http://localhost:6004/users/${id_user}`)
            .then(response => response.data)
            .catch(() => null);

        if (!userResponse) {
            return res.status(404).json({ message: "User does not exist" });
        }

        // ✅ Create the Reclamation
        const newReclamation = new Reclamation({
            id_user,
            message,
            date_created: new Date()
        });

        await newReclamation.save();
        res.status(201).json(newReclamation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ✅ GET ALL RECLAMATIONS (Fetch User Data from User Microservice)
router.get('/', async (req, res) => {
    try {
        let filter = {};

        if (req.query.id_user) {
            if (!mongoose.Types.ObjectId.isValid(req.query.id_user)) {
                return res.status(400).json({ message: "Invalid id_user format" });
            }
            filter.id_user = req.query.id_user;
        }

        const reclamations = await Reclamation.find(filter);

        // ✅ Fetch User Details Manually from User Microservice
        const populatedReclamations = await Promise.all(reclamations.map(async (reclamation) => {
            const user = await axios.get(`http://localhost:6004/users/${reclamation.id_user}`)
                .then(response => response.data)
                .catch(() => null);

            return {
                ...reclamation.toObject(),
                id_user: user || null
            };
        }));

        res.status(200).json(populatedReclamations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ GET RECLAMATION BY `_id`
router.get('/:id', async (req, res) => {
    try {
        const reclamation = await Reclamation.findById(req.params.id);

        if (!reclamation) {
            return res.status(404).json({ message: "Reclamation not found" });
        }

        // ✅ Fetch User Data from User Microservice
        const user = await axios.get(`http://localhost:6004/users/${reclamation.id_user}`)
            .then(response => response.data)
            .catch(() => null);

        res.status(200).json({
            ...reclamation.toObject(),
            id_user: user || null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ UPDATE A RECLAMATION MESSAGE
router.put('/:id', async (req, res) => {
    try {
        const updatedReclamation = await Reclamation.findByIdAndUpdate(
            req.params.id,
            { message: req.body.message },
            { new: true }
        );

        if (!updatedReclamation) {
            return res.status(404).json({ message: "Reclamation not found" });
        }

        res.status(200).json(updatedReclamation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ DELETE A RECLAMATION BY `_id`
router.delete('/:id', async (req, res) => {
    try {
        const deletedReclamation = await Reclamation.findByIdAndDelete(req.params.id);
        if (!deletedReclamation) {
            return res.status(404).json({ message: "Reclamation not found" });
        }

        res.status(200).json({ message: 'Reclamation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
