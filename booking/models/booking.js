const mongoose = require('mongoose');
const BookingSchema = new mongoose.Schema({
    date_hour_booking: { type: Date, required: true },
    date_hour_expire: { type: Date, required: true },
    id_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    id_car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
    current_Key_car: { type: String  },
    image: { type: String },
    renting: { type: Boolean, default: false },
    contrat: { type: String },
    paiement: { type: Number },
    location_Before_Renting: { type: String },
    location_After_Renting: { type: String },
    estimated_Location: { type: String }
}, { timestamps: true });
  
  const Booking = mongoose.model('Booking', BookingSchema);
  module.exports = Booking;
  