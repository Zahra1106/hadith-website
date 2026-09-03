const express = require('express');
const compression = require('compression');
const apiRouter = require('./routes/api');

// Shared Express API app — used both by server.js (local dev) and by
// api/[...slug].js (Vercel serverless function).
const app = express();
app.use(compression());
app.use(express.json());
app.use('/api', apiRouter);

module.exports = app;