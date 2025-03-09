const express = require('express');
const mongoose = require('mongoose');

const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(express.json());

// ✅ Connexion MongoDB avec la bonne base de données `cardb`
const MONGO_URI = 'mongodb://mongo:27017/admindb';

mongoose.connect(process.env.MONGO_URI_ADMIN)
    .then(() => console.log('✅ Connexion MongoDB (Admin) réussie'))
    .catch(err => {
        console.error('❌ Erreur de connexion MongoDB', err);
        process.exit(1);
    });

// ✅ Routes
app.use('/admins', adminRoutes);

// ✅ Middleware de gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erreur serveur' });
});

module.exports = app;
