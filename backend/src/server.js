/**
 * Server Entry Point
 * Listens on PORT (default 5000)
 */

require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🎓 Student Committee Platform Backend Running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`⚡ Health: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/login`);
  console.log(`🏛️ Committees: http://localhost:${PORT}/api/committees`);
  console.log(`=======================================================`);
});
