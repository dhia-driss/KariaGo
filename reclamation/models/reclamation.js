const mongoose = require('mongoose');

const ReclamationSchema = new mongoose.Schema({
    id_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
    message: { type: String, required: true }, // Complaint Message
    date_created: { type: Date, default: Date.now } // Auto-set the creation date
}, { timestamps: true });

const Reclamation = mongoose.models.Reclamation || mongoose.model('Reclamation', ReclamationSchema);
module.exports = Reclamation;
