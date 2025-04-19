const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

console.log("✅ Loading Admin Model...");

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // ✅ Secure password storage
    phone: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true }
}, { timestamps: true });

// ✅ Hash Password Before Saving
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Skip if password is unchanged
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        console.log("✅ Admin Password Hashed Successfully");
        next();
    } catch (error) {
        console.error("❌ Error Hashing Password:", error);
        next(error);
    }
});

// ✅ Compare Entered Password with Hashed Password
adminSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

console.log("✅ Admin Schema Defined...");

module.exports = mongoose.model('Admin', adminSchema);
