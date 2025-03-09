const app = require('./app');

const PORT = process.env.PORT_CAR || 5002;
app.listen(PORT, () => console.log(` Car Service en cours sur le port ${PORT}`));
