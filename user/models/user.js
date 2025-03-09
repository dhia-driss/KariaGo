const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  cin: { type: String, required: true, unique: true },
  permis: { type: String, required: true },
  num_phone: { type: String, required: true },
  facture: { type: Number, default: 0  },
  nbr_fois_allocation: { type: Number, default: 0  },
  blacklist: { type: Boolean, default: false },
  iD_Booking: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BookingHistory' }]
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
