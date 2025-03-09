const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    id_user: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference as ObjectId
    id_car: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference as ObjectId
    date_hour_booking: { type: Date, required: true },
    date_hour_expire: { type: Date, required: true },
    current_Key_car: { type: String },
    image: { type: String },
    status: { type: Boolean, default: false },
    contrat: { type: String },
    paiement: { type: Number },
    location_Before_Renting: { type: String },
    location_After_Renting: { type: String },
    estimated_Location: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
