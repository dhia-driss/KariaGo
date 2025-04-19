require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const { spawn } = require('child_process');
const axios = require('axios');
const path = require('path');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT_GATEWAY || 5000;
const { authRouter } = require('./auth');

// ✅ Logging
app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));

// ✅ CORS & Body Parser with increased size limit
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ Auth Router
app.use('/auth', authRouter);

// ✅ Microservices Configuration
const services = {
  "/admins": { url: "http://localhost:6000", path: path.join(__dirname, "../admin/app.js") },
  "/bookings": { url: "http://localhost:6003", path: path.join(__dirname, "../booking/app.js") },
  "/cars": { url: "http://localhost:6002", path: path.join(__dirname, "../car/app.js") },
  "/reclamations": { url: "http://localhost:6001", path: path.join(__dirname, "../reclamation/app.js") },
  "/users": { url: "http://localhost:6004", path: path.join(__dirname, "../user/app.js") }
};

// ✅ Rate Limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS,
  message: "❌ Too many requests, please try again later."
});
app.use(limiter);

// ✅ Start Microservices
const microservicesProcesses = {};
const startMicroservices = () => {
  console.log("🚀 Starting Microservices...");
  for (const [route, service] of Object.entries(services)) {
    if (microservicesProcesses[route]) {
      console.log(`✅ ${route} is already running.`);
      continue;
    }

    const microserviceProcess = spawn('node', [service.path], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true
    });

    microservicesProcesses[route] = microserviceProcess;

    microserviceProcess.on('exit', (code) => {
      console.error(`❌ Microservice ${route} exited with code ${code}. Restarting...`);
      setTimeout(() => startMicroservices(), 3000);
    });
  }
};

// ✅ Health Check
const checkMicroserviceHealth = async () => {
  console.log("⏳ Checking microservices...");
  await new Promise(resolve => setTimeout(resolve, 5000));
  for (const [route, service] of Object.entries(services)) {
    try {
      const res = await axios.get(`${service.url}/health`);
      console.log(`✅ ${route} is UP: ${res.data.message}`);
    } catch (err) {
      console.error(`❌ ${route} is DOWN`);
    }
  }
};

// ✅ DB Connection Check
const verifyDatabaseConnections = async () => {
  for (const [route, service] of Object.entries(services)) {
    try {
      const res = await axios.get(`${service.url}/debug/database`);
      console.log(`🔍 ${route} DB Status: ${res.data.status}`);
    } catch (err) {
      console.error(`⚠️ ${route} DB Not Accessible`);
    }
  }
};

// ✅ Proxy Setup (Bypassing token for all routes for now)
Object.keys(services).forEach(route => {
  app.use(route, (req, res, next) => {
    createProxyMiddleware({
      target: services[route].url,
      changeOrigin: true,
      pathRewrite: (path) => path,
      onError: (err, req, res) => {
        console.error(`❌ Proxy Error on ${route}: ${err.message}`);
        res.status(502).json({ error: `Service ${route} is unavailable` });
      },
      onProxyReq: (proxyReq, req, res) => {
        if (req.body && Object.keys(req.body).length > 0) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
        console.log(`➡️ Proxying ${req.method} ${req.originalUrl} -> ${services[route].url}`);
      }
    })(req, res, next);
  });
});

// ✅ Debug Endpoint
app.get('/debug/services', (req, res) => {
  res.json({ available_services: Object.keys(services) });
});

// ✅ Gateway Health Check
app.get('/health', (req, res) => {
  res.json({ message: "API Gateway is Running 🚀" });
});

// ✅ Fallback
app.use((req, res) => {
  console.warn(`❌ Unmatched Route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Route Not Found" });
});

// ✅ Start the Gateway
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  startMicroservices();
  await checkMicroserviceHealth();
  await verifyDatabaseConnections();
});
