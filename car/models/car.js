const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    matricule: { type: String, required: true, unique: true },
    marque:{type: String, required: true},
    panne: { type: String, required: true },
    panne_ia: { type: String, required: true },
    location: { type: String, required: true },
    visite_technique: { type: Date, required: true },
    car_work: { type: Boolean, default: true },
    date_assurance: { type: Date, required: true },
    vignette: { type: Date, required: true },
    diagnostique_vidange: {
        vidange1: { type: Number },
        vidange2: { type: Number },
        vidange3: { type: Number }
    }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);
