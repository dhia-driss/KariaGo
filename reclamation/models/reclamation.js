const mongoose = require('mongoose');
const ReclamationSchema = new mongoose.Schema({
    id_Car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
    id_User: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reclamation: { type: String, required: true },
    date_hour: { type: Date, default: Date.now },
    id_Booking: { type: mongoose.Schema.Types.ObjectId, ref: 'BookingHistory', required: true },
    location: { type: String }
}, { timestamps: true});
  
  const Reclamation = mongoose.model('Reclamation', ReclamationSchema);
  module.exports = Reclamation;
  