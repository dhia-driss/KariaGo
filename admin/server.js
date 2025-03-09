const app = require('./app');

const PORT = process.env.PORT_ADMIN || 5005;
app.listen(PORT, () => console.log(` Admin Service en cours sur le port ${PORT}`));
