const dotenv = require('dotenv');
const path = require('path');

// Load .env file from the backend root directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
};
