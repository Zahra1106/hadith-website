// Vercel deploys this as a single serverless function at /api/index.
// vercel.json rewrites EVERY request (site pages, static assets, and
// /api/* calls) to this one function, and our shared Express app
// (see /app.js) handles routing internally from there — this avoids
// relying on Vercel's static-file detection for the public/ folder,
// which was the cause of "Cannot GET /" on some deployments.
module.exports = require('../app');
