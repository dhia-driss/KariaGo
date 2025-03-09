const app = require('./app');

const PORT = process.env.PORT_RECLAMATION || 5004;
app.listen(PORT, () => console.log(` Reclamation Service en cours sur le port ${PORT}`));
