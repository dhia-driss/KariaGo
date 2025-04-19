const express = require('express');
const mongoose = require('mongoose');
const Car = require('../models/car');

const router = express.Router();

/**
 * ✅ Create a New Car Entry
 * 🔹 Checks for required fields
 */
router.post('/', async (req, res) => {
    try {
        const { matricule, marque, location } = req.body;

        // Validate required fields
        if (!matricule || !marque || !location) {
            return res.status(400).json({ message: "Matricule, Marque, and Location are required." });
        }

        // Remove `_id` if it exists in the request body
        delete req.body._id;

        // Check for duplicate matricule
        const existingCar = await Car.findOne({ matricule });
        if (existingCar) {
            return res.status(400).json({ message: "A car with this matricule already exists." });
        }

        const newCar = new Car(req.body);
        const savedCar = await newCar.save();
        res.status(201).json(savedCar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * ✅ Get All Cars (With Filters)
 * 🔹 Filter by `car_work`, `location`, or any field
 */
router.get('/', async (req, res) => {
    try {
        let filter = {};

        if (req.query.car_work) {
            filter.car_work = req.query.car_work === "true";
        }
        if (req.query.location) {
            filter.location = req.query.location;
        }

        const cars = await Car.find(filter);
        res.status(200).json(cars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * ✅ Get Car by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ message: "Voiture non trouvée" });
        }
        res.status(200).json(car);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * ✅ Update Car Information
 */
router.put('/:id', async (req, res) => {
    try {
        const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCar) {
            return res.status(404).json({ message: "Voiture non trouvée" });
        }
        res.status(200).json(updatedCar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * ✅ Update `car_work` Based on Raspberry Pi Engine Data
 */
router.put('/:id/update-status', async (req, res) => {
    try {
        const { engineRunning } = req.body;
        if (typeof engineRunning !== "boolean") {
            return res.status(400).json({ message: "engineRunning doit être un booléen (true/false)." });
        }

        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ message: "Voiture non trouvée" });
        }

        car.car_work = engineRunning; // ✅ Update engine status
        await car.save();

        res.status(200).json({ message: "Statut du moteur mis à jour", car });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * ✅ Delete Car by ID
 */
router.delete('/:id', async (req, res) => {
    try {
        const deletedCar = await Car.findByIdAndDelete(req.params.id);
        if (!deletedCar) {
            return res.status(404).json({ message: "Voiture non trouvée" });
        }

        res.status(200).json({ message: 'Voiture supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
