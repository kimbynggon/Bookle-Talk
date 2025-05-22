var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {// be/routes/users.js
  const express = require('express');
  const router = express.Router();
  const db = require('../services/db');
  
  // Get user profile
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Register new user
  router.post('/', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      // Check if user already exists
      const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      
      // Insert new user
      const result = await db.query(
        'INSERT INTO users (username, email, password, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, username, email',
        [username, email, password] // Note: In a real app, you should hash the password
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  module.exports = router;
});

module.exports = router;
