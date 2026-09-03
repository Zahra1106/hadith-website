const express = require('express');
const compression = require('compression');
const path = require('path');
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());
app.use(express.json());

// API routes
app.use('/api', apiRouter);

// Static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for any non-API route (simple single-page site)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`\n  As-Sahifah is running:  http://localhost:${PORT}\n`);
});
