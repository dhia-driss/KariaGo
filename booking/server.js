const app = require('./app');

const PORT = process.env.PORT_BOOKING || 5003;
app.listen(PORT, () => console.log(`📅 Booking Service en cours sur le port ${PORT}`));
