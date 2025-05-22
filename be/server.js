const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { sequelize } = require('./models');
const logger = require('./utils/logger');
const routes = require('./routes');
const { setupMiddleware } = require('./middlewares');
const { setupSocketIO } = require('./socket');

const PORT = process.env.PORT || 3000;

// Initialize Express app
const app = express();

// Setup middleware
setupMiddleware(app);

// Setup routes
app.use('/', routes);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with secure CORS settings
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'development' ? "*" : "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Setup Socket.io handlers
setupSocketIO(io);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    await sequelize.sync({ force: false });
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();