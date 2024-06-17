// register.js
// Copyright (c) 2024 Joey Manani <https://cdn.theflyingrat.com/LICENSE>
// Allow user to register

const express = require('express');
const router = express.Router();
const { argon2id } = require('hash-wasm');
const { webcrypto } = require('crypto');

module.exports = (database) => {
  /* POST register page. */
  router.post('/', async (req, res, next) => {
    // Extract registration data from the request body
    const { name, email, phone_number, address, password } = req.body;

    try {
      // Validate that all required parameters are present
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Missing required parameters.' });
      }

      // Generate a random salt using webcrypto
      const salt = webcrypto.getRandomValues(new Uint8Array(16));

      // Hash the user's password using argon2, pretty secure... Depends on the server being used. Can be slow on slower processors.
      try {
        var hashedPassword = await argon2id({
          password: password,
          salt: salt,
          hashLength: 64,
          iterations: 16,
          memorySize: 128,
          parallelism: 8,
          outputType: 'encoded'
        });
      // Rest of the code that depends on hashedPassword, so check if it failed
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Registration failed. Please try again later.' });
      }

      // Check if a user with the same email already exists
      database.get('SELECT * FROM Beekeepers WHERE email = ?', [email], (err, existingUser) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Registration failed. Please try again later.' });
        }

        if (existingUser) {
          return res.status(409).json({ error: 'User with the same email already exists.' });
        } else {
          // Insert the user's registration data into the Beekeepers table
          const sql = 'INSERT INTO Beekeepers (name, email, phone_number, address, password) VALUES (?, ?, ?, ?, ?)';
          const params = [name, email, phone_number, address, hashedPassword];
          database.run(sql, params, (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: 'Registration failed. Please try again later.' });
            }

            console.log("New user registered: " + name);

            // If registration is successful, return a success response
            res.status(200).json({ message: 'Registration successful.' });
          });
        }
      });
    } catch (err) {
      return res.status(500).json({ error: 'Registration failed. Please try again later.' });
    }
  });

  return router;
};
