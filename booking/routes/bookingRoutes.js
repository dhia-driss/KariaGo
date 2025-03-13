const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const Booking = require('../models/booking');

const router = express.Router();

// ✅ Load Environment Variables
const USER_SERVICE_URL = process.env.USER_SERVICE || 'http://localhost:6004/users';
const CAR_SERVICE_URL = process.env.CAR_SERVICE || 'http://localhost:6002/cars';

// ✅ Centralized Function to Fetch Data via Axios
const fetchFromService = async (url) => {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`❌ Axios Fetch Failed: ${url} - ${error.message}`);
        return null;
    }
};

// ✅ CREATE A NEW BOOKING (Ensures User & Car Exist)
router.post('/', async (req, res) => {
    try {
        const { id_user, id_car, date_hour_booking, date_hour_expire, current_Key_car, image, status, contrat, paiement, location_Before_Renting, location_After_Renting, estimated_Location } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id_user) || !mongoose.Types.ObjectId.isValid(id_car)) {
            return res.status(400).json({ message: "Invalid id_user or id_car format." });
        }

        // ✅ Verify User Exists
        const user = await fetchFromService(`${USER_SERVICE_URL}/${id_user}`);
        if (!user) return res.status(404).json({ message: "User not found." });

        // ✅ Verify Car Exists
        const car = await fetchFromService(`${CAR_SERVICE_URL}/${id_car}`);
        if (!car) return res.status(404).json({ message: "Car not found." });

        // ✅ Prevent Double Booking
        const existingBooking = await Booking.findOne({
            id_car,
            status: true, // ✅ Checks for active rentals
            $or: [
                { date_hour_booking: { $lte: date_hour_expire, $gte: date_hour_booking } },
                { date_hour_expire: { $lte: date_hour_expire, $gte: date_hour_booking } }
            ]
        });

        if (existingBooking) {
            return res.status(400).json({ message: "Car is already booked during this period." });
        }

        // ✅ Create New Booking
        const newBooking = new Booking({
            id_user,
            id_car,
            date_hour_booking,
            date_hour_expire,
            current_Key_car,
            image,
            status: status || false,
            contrat,
            paiement,
            location_Before_Renting,
            location_After_Renting,
            estimated_Location
        });

        await newBooking.save();
        res.status(201).json(newBooking);
    } catch (error) {
        console.error("❌ Booking Creation Error:", error);
        res.status(500).json({ message: error.message });
    }
});

// ✅ GET ALL BOOKINGS (Includes User & Car Data)
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find();
        const populatedBookings = await Promise.all(bookings.map(async (booking) => {
            const user = await fetchFromService(`${USER_SERVICE_URL}/${booking.id_user}`);
            const car = await fetchFromService(`${CAR_SERVICE_URL}/${booking.id_car}`);

            return {
                ...booking.toObject(),
                user: user || null,
                car: car || null
            };
        }));

        res.status(200).json(populatedBookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ GET BOOKING BY `id_booking`
router.get('/:id_booking', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id_booking);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        const user = await fetchFromService(`${USER_SERVICE_URL}/${booking.id_user}`);
        const car = await fetchFromService(`${CAR_SERVICE_URL}/${booking.id_car}`);

        res.status(200).json({
            ...booking.toObject(),
            user: user || null,
            car: car || null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ GET BOOKINGS FOR A SPECIFIC USER
router.get('/user/:id_user', async (req, res) => {
    try {
        const bookings = await Booking.find({ id_user: req.params.id_user });
        if (!bookings.length) return res.status(404).json({ message: "No bookings found for this user." });

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ GET BOOKINGS FOR A SPECIFIC CAR
router.get('/car/:id_car', async (req, res) => {
    try {
        const bookings = await Booking.find({ id_car: req.params.id_car });
        if (!bookings.length) return res.status(404).json({ message: "No bookings found for this car." });

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ UPDATE A BOOKING
router.put('/:id_booking', async (req, res) => {
    try {
        const { id_booking } = req.params;
        const updateFields = req.body;

        // ✅ Ensure the booking exists
        const booking = await Booking.findById(id_booking);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // ✅ Prevent updates to `id_user` or `id_car`
        if (updateFields.id_user || updateFields.id_car) {
            return res.status(400).json({ message: "Updating id_user or id_car is not allowed." });
        }

        // ✅ Update Booking
        const updatedBooking = await Booking.findByIdAndUpdate(
            id_booking,
            updateFields,
            { new: true }
        );

        res.status(200).json(updatedBooking);
    } catch (error) {
        console.error("❌ Booking Update Error:", error);
        res.status(500).json({ message: error.message });
    }
});


// ✅ DELETE A BOOKING BY `id_booking`
router.delete('/:id_booking', async (req, res) => {
    try {
        const deletedBooking = await Booking.findByIdAndDelete(req.params.id_booking);
        if (!deletedBooking) return res.status(404).json({ message: "Booking not found" });

        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ CHECK IF A CAR IS AVAILABLE (NEW FUNCTION)
router.get('/car/:id_car/availability', async (req, res) => {
    try {
        const car = await fetchFromService(`${CAR_SERVICE_URL}/${req.params.id_car}`);
        if (!car) return res.status(404).json({ message: "Car not found." });

        res.status(200).json({ available: car.car_work });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
