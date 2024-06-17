// login.js
// Copyright (c) 2024 Joey Manani <https://cdn.theflyingrat.com/LICENSE>
// Allow user to login

const express = require('express');
const router = express.Router();
const { argon2Verify } = require('hash-wasm');

module.exports = (database) => {
  /* POST login page. */
  router.post('/', async (req, res, next) => {
    try {
      // Extract login data from the request body
      const { email, password } = req.body;

      // Validate that all required parameters are present
      if (!email || !password) {
        return res.status(400).json({ error: 'Missing required parameters.' });
      }

      // Check if a user with the provided email exists
      return database.get(`SELECT * FROM Beekeepers WHERE email = ?`, [email], async (err, user) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Login failed. Please try again later.' });
        }

        // If the username is wrong, "Invalid credentials."
        if (!user || Object.keys(user).length == 0) {
          return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Verify the password using argon2
        const passwordMatch = await argon2Verify({
          password: password,
          hash: user.password,
        });

        // If password is wrong, "Invalid credentials." - This prevents a hacker from determining if its the email or the password thats wrong.
        if (!passwordMatch) {
          return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // If password is correct, set user session
        req.session.beekeeper_id = user.beekeeper_id;
        req.session.name = user.name;

        console.log("Successful login by: " + user.name);

        // Return a success response
        res.status(200).json({ message: 'Login successful.' });
      
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Login failed. Please try again later.' });
    }
  });
  return router;
};
