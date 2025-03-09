const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();

app.use("/admin", createProxyMiddleware({ target: "http://KariaGo_Admin:3005", changeOrigin: true }));
app.use("/user", createProxyMiddleware({ target: "http://KariaGo_User:3001", changeOrigin: true }));
app.use("/car", createProxyMiddleware({ target: "http://KariaGo_Car:3002", changeOrigin: true }));
app.use("/booking", createProxyMiddleware({ target: "http://KariaGo_Booking:3003", changeOrigin: true }));
app.use("/reclamation", createProxyMiddleware({ target: "http://KariaGo_Reclamation:3004", changeOrigin: true }));

app.listen(3000, () => console.log("🚀 API Gateway active sur le port 3000"));
