const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const Booking = require('../models/booking');
const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE || 'http://localhost:6004';
const CAR_SERVICE_URL = process.env.CAR_SERVICE || 'http://localhost:6002';

const axiosInstance = axios.create({ timeout: 4000 });
const fetchFromService = async (url) => {
  try {
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error(`❌ Axios Fetch Failed: ${url} - ${error.message}`);
    return null;
  }
};

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads')); // Save files in the `uploads` directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// ✅ CREATE A NEW BOOKING
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      id_user, id_car, date_hour_booking, date_hour_expire,
      current_Key_car, status, contrat, paiement,
      location_Before_Renting, location_After_Renting, estimated_Location
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id_user) || !mongoose.Types.ObjectId.isValid(id_car)) {
      return res.status(400).json({ message: "Invalid id_user or id_car format." });
    }

    const user = await fetchFromService(`${USER_SERVICE_URL}/users/${id_user}`);
    if (!user) return res.status(404).json({ message: "User not found." });

    const car = await fetchFromService(`${CAR_SERVICE_URL}/cars/${id_car}`);
    if (!car) return res.status(404).json({ message: "Car not found." });

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const newBooking = new Booking({
      id_user,
      id_car,
      date_hour_booking,
      date_hour_expire,
      current_Key_car,
      image, // Save the image path here
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
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

// ✅ GET ALL BOOKINGS
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date_hour_booking: -1 });
    const populated = await Promise.all(bookings.map(async (b) => {
      const user = await fetchFromService(`${USER_SERVICE_URL}/users/${b.id_user}`);
      const car = await fetchFromService(`${CAR_SERVICE_URL}/cars/${b.id_car}`);
      return { ...b.toObject(), user: user || null, car: car || null };
    }));
    res.status(200).json(populated);
  } catch (error) {
    console.error("❌ /bookings route error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

// ✅ GET BOOKING BY ID
router.get('/:id_booking', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id_booking);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const user = await fetchFromService(`${USER_SERVICE_URL}/users/${booking.id_user}`);
    const car = await fetchFromService(`${CAR_SERVICE_URL}/cars/${booking.id_car}`);

    res.status(200).json({ ...booking.toObject(), user: user || null, car: car || null });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

// ✅ GET BOOKINGS BY USER
router.get('/user/:id_user', async (req, res) => {
  try {
    const bookings = await Booking.find({ id_user: req.params.id_user });
    if (!bookings.length) return res.status(404).json({ message: "No bookings found for this user." });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

// ✅ GET BOOKINGS BY CAR
router.get('/car/:id_car', async (req, res) => {
  try {
    const bookings = await Booking.find({ id_car: req.params.id_car });
    if (!bookings.length) return res.status(404).json({ message: "No bookings found for this car." });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

// ✅ UPDATE BOOKING
router.put('/:id_booking', upload.single('image'), async (req, res) => {
  try {
    console.log('Incoming payload:', req.body); // Debugging log

    const updateFields = req.body;

    if (req.file) {
      updateFields.image = `/uploads/${req.file.filename}`;
    }

    const booking = await Booking.findById(req.params.id_booking);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (updateFields.id_user || updateFields.id_car) {
      return res.status(400).json({ message: "Updating id_user or id_car is not allowed." });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id_booking,
      updateFields,
      { new: true }
    );

    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error); // Debugging log
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

// ✅ DELETE BOOKING
router.delete('/:id_booking', async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id_booking);
    if (!deleted) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

// ✅ CHECK CAR AVAILABILITY
router.get('/car/:id_car/availability', async (req, res) => {
  try {
    const car = await fetchFromService(`${CAR_SERVICE_URL}/cars/${req.params.id_car}`);
    if (!car) return res.status(404).json({ message: "Car not found." });
    res.status(200).json({ available: car.car_work });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

// ✅ CONFIRM BOOKING
router.put('/:id_booking/confirm', async (req, res) => {
  try {
    const { contrat, paiement } = req.body;
    if (!contrat || !paiement) {
      return res.status(400).json({ message: "Contract and payment are required to confirm the booking." });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id_booking,
      { contrat, paiement, status: true },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found." });
    res.status(200).json({ message: "Booking confirmed", booking });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

// ✅ CANCEL BOOKING
router.put('/:id_booking/cancel', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id_booking,
      { status: false, contrat: null, paiement: 0 },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found." });
    res.status(200).json({ message: "Booking cancelled", booking });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});

// ✅ Serve uploaded images statically
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = router;
