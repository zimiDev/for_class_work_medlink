const config = require('./config');
const app = require('./app');

const PORT = config.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});

// Some managed dev shells can let the process exit after listen() unless another
// active handle is present. Keep the API process alive for local development.
setInterval(() => {}, 1 << 30);
