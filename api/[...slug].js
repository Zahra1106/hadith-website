// Vercel maps this file's [...slug] filename to catch every request under
// /api/*, and forwards it to our shared Express app (see /app.js at the
// project root).
module.exports = require('../app');