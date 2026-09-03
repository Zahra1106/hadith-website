const express = require('express');
const compression = require('compression');
const path = require('path');
const apiRouter = require('./routes/api');

// Shared Express app — used both by server.js (local dev) and by the
// Vercel serverless function (see api/index.js). It now handles
// everything itself (API + static frontend + fallback to index.html),
// so on Vercel a single function can serve the whole site.
const app = express();
app.use(compression());
app.use(express.json());

app.use('/api', apiRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

module.exports = app;
