// hives.js
// Copyright (c) 2024 Joey Manani <https://cdn.theflyingrat.com/LICENSE>
// API routes for Hives

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

module.exports = (database) => {
  /* POST create a new hive */
  router.post('/', authMiddleware, (req, res, next) => {
    const { hive_name, location, hive_type } = req.body;
    const beekeeper_id = req.session.beekeeper_id;

    // Validate that all required parameters are present
    if (!hive_name || !beekeeper_id) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    // Check if a hive with the same name already exists for the beekeeper
    const checkSql = 'SELECT * FROM Hives WHERE hive_name = ? AND beekeeper_id = ?';
    database.get(checkSql, [hive_name, beekeeper_id], (err, existingHive) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create hive. Please try again later.' });
      }

      if (existingHive) {
        return res.status(409).json({ error: 'Hive with the same name already exists.' });
      }

      // Insert the hive data into the Hives table
      const insertSql = 'INSERT INTO Hives (beekeeper_id, hive_name, location, hive_type) VALUES (?, ?, ?, ?)';
      const params = [beekeeper_id, hive_name, location, hive_type];
      database.run(insertSql, params, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to create hive. Please try again later.' });
        }

        console.log("New hive created for beekeeper: " + beekeeper_id);

        // If creation is successful, return a success response
        res.status(200).json({ message: 'Hive creation successful.' });
      });
    });
  });

  /* GET retrieve hives with optional filtering */
  router.get('/', authMiddleware, (req, res, next) => {
    const { location, hive_name, beekeeper_id } = req.query;

    let sql = 'SELECT * FROM Hives WHERE 1=1';
    const params = [];

    // Check for the optional filtering params
    if (location) {
      sql += ' AND location = ?';
      params.push(location);
    }

    if (hive_name) {
      sql += ' AND hive_name = ?';
      params.push(hive_name);
    }

    if (beekeeper_id) {
      sql += ' AND beekeeper_id = ?';
      params.push(beekeeper_id);
    }

    database.all(sql, params, (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to retrieve hives. Please try again later.' });
      }

      res.status(200).json(rows);
    });
  });

  /* PATCH update hive data */
  router.patch('/:hive_id', authMiddleware, (req, res, next) => {
    const hive_id = req.params.hive_id;
    const { hive_name, location, hive_type } = req.body;
    const beekeeper_id = req.session.beekeeper_id;

    // Validate that hive_id and beekeeper_id are present
    if (!hive_id || !beekeeper_id) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    // Check if the hive belongs to the logged-in beekeeper
    const checkOwnershipSql = 'SELECT * FROM Hives WHERE hive_id = ? AND beekeeper_id = ?';
    database.get(checkOwnershipSql, [hive_id, beekeeper_id], (err, hive) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update hive. Please try again later.' });
      }

      if (!hive) {
        return res.status(404).json({ error: 'Hive not found or not owned by the user.' });
      }

      // COALESCE is basically a ternary operator, if the given value is NULL, set the value to itself
      // Essentially its doing: "hive_name = 'whatever'; if(hive_name == null) { hive_name = hive_name } else { hive_name = 'whatever' } 
      // Update hive data
      const updateSql = `
        UPDATE Hives
        SET hive_name = COALESCE(?, hive_name),
            location = COALESCE(?, location),
            hive_type = COALESCE(?, hive_type)
        WHERE hive_id = ? AND beekeeper_id = ?
      `;
      const params = [hive_name, location, hive_type, hive_id, beekeeper_id];
      database.run(updateSql, params, function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to update hive. Please try again later.' });
        }

        console.log("Hive updated for beekeeper: " + beekeeper_id);

        // Return a success response
        res.status(200).json({ message: 'Hive update successful.' });
      });
    });
  });

  /* DELETE remove a hive */
  router.delete('/:hive_id', authMiddleware, (req, res, next) => {
    const hive_id = req.params.hive_id;
    const beekeeper_id = req.session.beekeeper_id;

    // Validate that hive_id and beekeeper_id are present
    if (!hive_id || !beekeeper_id) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    // Check if the hive belongs to the logged in beekeeper
    const checkOwnershipSql = 'SELECT * FROM Hives WHERE hive_id = ? AND beekeeper_id = ?';
    database.get(checkOwnershipSql, [hive_id, beekeeper_id], (err, hive) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete hive. Please try again later.' });
      }

      if (!hive) {
        return res.status(404).json({ error: 'Hive not found or not owned by the user.' });
      }

      // Delete hive 
      const deleteSql = 'DELETE FROM Hives WHERE hive_id = ? AND beekeeper_id = ?';
      database.run(deleteSql, [hive_id, beekeeper_id], function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to delete hive. Please try again later.' });
        }

        console.log("Hive deleted for beekeeper: " + beekeeper_id);

        // Return a success response
        res.status(200).json({ message: 'Hive deletion successful.' });
      });
    });
  });

  
  return router;
};
