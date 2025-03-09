const mongoose = require('mongoose');

console.log("✅ Loading Car Model...");

// 🔍 Diagnostique Vidange Schema (Now Using Dates)
const diagnostiqueVidangeSchema = new mongoose.Schema({
    vidange1: { type: Date, default: null }, // First oil change date
    vidange2: { type: Date, default: null }, // Second oil change date
    vidange3: { type: Date, default: null }, // Third oil change date
    last_updated: { type: Date, default: Date.now } // Tracks last maintenance update
}, { _id: false });

// 🔍 Main Car Schema
const CarSchema = new mongoose.Schema({
    matricule: { type: String, required: true, unique: true, trim: true },
    marque: { type: String, required: true, trim: true },
    panne: { type: String, required: true, trim: true }, // "No issues" if no problems
    panne_ia: [{ type: String, trim: true }], // AI-detected issues (Array)
    location: { type: String, required: true, trim: true },
    visite_technique: { type: Date, required: true, default: null },
    car_work: { type: Boolean, default: null }, // ✅ Now updated based on Raspberry Pi data
    date_assurance: { type: Date, required: true, default: null },
    vignette: { type: Date, required: true, default: null },
    diagnostique_vidange: diagnostiqueVidangeSchema
}, { timestamps: true });

// ✅ Function to Update `car_work` Based on Raspberry Pi Data
CarSchema.methods.updateCarWorkStatus = function (engineRunning) {
    this.car_work = engineRunning; // ✅ Set True if Engine is Running, False if Off
    return this.save();
};

console.log("✅ Car Schema Defined...");

// ✅ Register Model Only Once
const Car = mongoose.models.Car || mongoose.model('Car', CarSchema);

console.log("✅ Car Model Registered:", mongoose.modelNames());

module.exports = Car;
