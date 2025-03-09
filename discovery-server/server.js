const express = require('express');
const app = express();

app.use(express.json());

let services = {}; // Stocke les services enregistrés

// Route pour enregistrer un microservice
app.post('/register', (req, res) => {
    const { serviceName, serviceUrl } = req.body;

    if (!serviceName || !serviceUrl) {
        return res.status(400).json({ message: 'Missing serviceName or serviceUrl' });
    }

    services[serviceName] = { url: serviceUrl, timestamp: Date.now() };
    console.log(`Service enregistré : ${serviceName} à ${serviceUrl}`);
    res.status(200).json({ message: `Service ${serviceName} enregistré avec succès` });
});

// Route pour récupérer la liste des services enregistrés
app.get('/services', (req, res) => {
    res.status(200).json(services);
});

// Route pour supprimer un service (ex : si un microservice est arrêté)
app.post('/unregister', (req, res) => {
    const { serviceName } = req.body;

    if (!services[serviceName]) {
        return res.status(404).json({ message: `Service ${serviceName} non trouvé` });
    }

    delete services[serviceName];
    console.log(`Service supprimé : ${serviceName}`);
    res.status(200).json({ message: `Service ${serviceName} supprimé` });
});

// Démarrer le serveur de découverte
const PORT = 3000;
app.listen(PORT, () => console.log(` Serveur de découverte actif sur le port ${PORT}`));
