const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n  As-Sahifah is running:  http://localhost:${PORT}\n`);
});
