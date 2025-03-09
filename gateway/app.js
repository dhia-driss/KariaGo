require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const { spawn } = require('child_process');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT_GATEWAY || 5000;
const { authRouter, verifyToken } = require('./auth');
const morgan = require('morgan');

// ✅ Logging Middleware
app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));

app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);

// ✅ Microservices Configuration
const services = {
    "/admins": { url: "http://localhost:6000", path: path.join(__dirname, "../admin/app.js") },
    "/bookings": { url: "http://localhost:6003", path: path.join(__dirname, "../booking/app.js") },
    "/cars": { url: "http://localhost:6002", path: path.join(__dirname, "../car/app.js") },
    "/reclamations": { url: "http://localhost:6001", path: path.join(__dirname, "../reclamation/app.js") },
    "/users": { url: "http://localhost:6004", path: path.join(__dirname, "../user/app.js") }
};

const rateLimit = require('express-rate-limit');

// ✅ Define Rate Limit
const limiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000, // Convert minutes to milliseconds
    max: process.env.RATE_LIMIT_MAX_REQUESTS,
    message: "❌ Too many requests, please try again later."
});

// ✅ Apply Rate Limiting to all API routes
app.use(limiter);

// ✅ Start Microservices if Not Already Running
const microservicesProcesses = {};

const startMicroservices = () => {
    console.log("🚀 Starting Microservices...");
    for (const [route, service] of Object.entries(services)) {
        if (microservicesProcesses[route]) {
            console.log(`✅ ${route} is already running.`);
            continue;
        }

        console.log(`🔄 Launching ${route} microservice...`);
        const microserviceProcess = spawn('node', [service.path], {
            cwd: __dirname,
            stdio: 'inherit',
            shell: true
        });

        microservicesProcesses[route] = microserviceProcess;

        microserviceProcess.on('exit', (code) => {
            console.error(`❌ Microservice ${route} exited with code ${code}. Restarting...`);
            setTimeout(() => startMicroservices(), 3000); // Restart after 3 seconds if it crashes
        });
    }
};

// ✅ Verify Each Microservice Health
const checkMicroserviceHealth = async () => {
    console.log("⏳ Waiting for microservices to fully start...");
    await new Promise(resolve => setTimeout(resolve, 5000)); // ✅ Wait 5 sec before checking

    for (const [route, service] of Object.entries(services)) {
        try {
            const response = await axios.get(`${service.url}/health`);
            console.log(`✅ ${route} is UP and Running: ${response.data.message}`);
        } catch (error) {
            console.error(`❌ ${route} is NOT Responding!`);
        }
    }
};

// ✅ Verify Database Connections
const verifyDatabaseConnections = async () => {
    for (const [route, service] of Object.entries(services)) {
        try {
            const response = await axios.get(`${service.url}/debug/database`);
            console.log(`🔍 ${route} Database Connection: ${response.data.status}`);
        } catch (error) {
            console.error(`⚠️ ${route} Database Not Accessible!`);
        }
    }
};

// ✅ Exempt Login Routes from Token Verification
const openRoutes = [
    "/auth/admin/login",
    "/auth/user/login"
];

// ✅ Proxy Requests to Microservices (Skip `verifyToken` for Open Routes)
Object.keys(services).forEach(route => {
    app.use(route, (req, res, next) => {
        // ✅ Bypass token verification for specific routes
        if (
            req.originalUrl.startsWith("/auth/admin/login") ||
            req.originalUrl.startsWith("/auth/user/login") ||
            (req.originalUrl.startsWith("/admins") && req.method === "GET") || 
            (req.originalUrl.startsWith("/users") && req.method === "GET")
        ) {
            console.log(`🟢 Bypassing token check for: ${req.method} ${req.originalUrl}`);
            return createProxyMiddleware({
                target: services[route].url,
                changeOrigin: true,
                pathRewrite: (path) => path.replace(route, ''),
                onError: (err, req, res) => {
                    console.error(`❌ Proxy Error on ${route}: ${err.message}`);
                    res.status(502).json({ error: `Service ${route} is unavailable` });
                }
            })(req, res, next);
        }

        // ✅ Apply Token Verification for All Other Routes
        verifyToken(req, res, () => {
            console.log(`🔀 Forwarding request to ${services[route].url}${req.url}`);
            createProxyMiddleware({
                target: services[route].url,
                changeOrigin: true,
                pathRewrite: (path) => path.replace(route, ''),
                onError: (err, req, res) => {
                    console.error(`❌ Proxy Error on ${route}: ${err.message}`);
                    res.status(502).json({ error: `Service ${route} is unavailable` });
                }
            })(req, res, next);
        });
    });
});


// ✅ Debugging Route: Check Available Services
app.get('/debug/services', (req, res) => {
    res.json({ available_services: Object.keys(services) });
});

// ✅ API Gateway Health Check
app.get('/health', (req, res) => {
    res.json({ message: "API Gateway is Running 🚀" });
});

// ✅ Default Route for Errors
app.use((req, res) => {
    console.warn(`❌ Unmatched Route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: "Route Not Found" });
});

// ✅ Start API Gateway
app.listen(PORT, async () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
    startMicroservices();
    await checkMicroserviceHealth();
    await verifyDatabaseConnections();
});
