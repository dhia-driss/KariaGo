const express = require('express');
const Reclamation = require('../models/reclamation');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const newReclamation = new Reclamation(req.body);
        await newReclamation.save();
        res.status(201).json(newReclamation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const reclamations = await Reclamation.find();
        res.status(200).json(reclamations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedReclamation = await Reclamation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedReclamation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Reclamation.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Réclamation supprimée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
