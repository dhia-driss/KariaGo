const app = require('./app');

const PORT = process.env.PORT_USER || 5001;
app.listen(PORT, () => console.log(` User Service en cours sur le port ${PORT}`));
