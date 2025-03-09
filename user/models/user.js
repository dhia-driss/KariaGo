const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

console.log("✅ Loading User Model...");

const UserSchema = new mongoose.Schema({
    cin: { type: String, required: true, unique: true, trim: true },
    permis: { type: String, required: true, unique: true, trim: true },
    num_phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true }, // ✅ New password field (hashed)
    facture: { type: Number, default: 0 },
    nbr_fois_allocation: { type: Number, default: 0 },
    blacklisted: { type: Boolean, default: false },
}, { timestamps: true });

// ✅ Hash Password Before Saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        console.log("✅ Password Hashed Successfully");
        next();
    } catch (error) {
        next(error);
    }
});

// ✅ Compare Entered Password with Hashed Password
UserSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

console.log("✅ User Schema Defined...");

// ✅ Ensure Model is Registered Only Once
if (!mongoose.models.User) {
    module.exports = mongoose.model('User', UserSchema);
    console.log("✅ User Model Registered:", mongoose.modelNames());
} else {
    module.exports = mongoose.models.User;
    console.log("✅ User Model Already Registered.");
}
