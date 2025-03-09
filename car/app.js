const express = require('express');
const mongoose = require('mongoose');

const reclamationRoutes = require('./routes/reclamationRoutes');

const app = express();
app.use(express.json());

// ✅ Connexion MongoDB avec la bonne base de données `cardb`
const MONGO_URI = 'mongodb://mongo:27017/reclamationdb';

mongoose.connect(process.env.MONGO_URI_CAR)
    .then(() => console.log('✅ Connexion MongoDB (Reclamation) réussie'))
    .catch(err => {
        console.error('❌ Erreur de connexion MongoDB', err);
        process.exit(1);
    });

// ✅ Routes
app.use('/reclamations', carRoutes);

// ✅ Middleware de gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erreur serveur' });
});

module.exports = app;
