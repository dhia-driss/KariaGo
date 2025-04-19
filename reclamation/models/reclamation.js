const mongoose = require('mongoose');

const ReclamationSchema = new mongoose.Schema({
    id_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    image: { type: String }, 
    date_created: { type: Date, default: Date.now }
}, { timestamps: true });

const Reclamation = mongoose.models.Reclamation || mongoose.model('Reclamation', ReclamationSchema);
module.exports = Reclamation;
