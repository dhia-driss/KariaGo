const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config({ path: '../config/.env' });

const reclamationRoutes = require('./routes/reclamationRoutes');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI_ADMIN)

    .then(() => console.log(' Connexion MongoDB (Reclamation) réussie'))
    .catch(err => console.error(' Erreur de connexion MongoDB', err));

app.use('/reclamations', reclamationRoutes);
module.exports = app;
