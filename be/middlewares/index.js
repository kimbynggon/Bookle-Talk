const cors = require('cors');
const express = require('express');
const logger = require('../utils/logger');
const path = require('path');

const setupMiddleware = (app) => {
  // View engine setup
  app.set('views', path.join(__dirname, '../views'));
  app.set('view engine', 'ejs');

  // Middleware setup
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cors());
  app.use(express.static(path.join(__dirname, '../public')));

  // Request logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });
};

module.exports = { setupMiddleware };
