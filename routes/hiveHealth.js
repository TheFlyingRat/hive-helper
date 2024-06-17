// hiveHealth.js
// Copyright (c) 2024 Joey Manani <https://cdn.theflyingrat.com/LICENSE>
// API routes for HiveHealth

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

module.exports = (database) => {
  /* GET retrieve health records for a specific hive or all hives */
  router.get('/:id?', authMiddleware, (req, res, next) => {
    const hive_id = req.params.id;

    let sql = 'SELECT * FROM HiveHealth';
    let params = [];

    // If a hive_id is provided, filter the results for that hive
    if (hive_id) {
    sql += ' WHERE hive_id = ?';
    params.push(hive_id);
    }

    database.all(sql, params, (err, rows) => {
    if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to retrieve health records. Please try again later.' });
    }

    // If hive_id is provided, return the results directly
    if (hive_id) {
        return res.status(200).json(rows);
    } else {
        // Group the results by hive_id
        const groupedResults = rows.reduce((acc, row) => {
        acc[row.hive_id] = acc[row.hive_id] || [];
        acc[row.hive_id].push(row);
        return acc;
        }, {});

        res.status(200).json(groupedResults);
    }
    });
  });
  
  /* POST create a new health record */
  router.post('/', authMiddleware, (req, res, next) => {
    const { hive_id, temperature, humidity, activity_level } = req.body;

    // Validate that all required parameters are present
    if (!hive_id || !temperature || !humidity || !activity_level) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    // Check if the provided hive_id exists in the Hives table
    database.get('SELECT * FROM Hives WHERE hive_id = ?', [hive_id], (err, hive) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create health record. Please try again later.' });
      }

      if (!hive) {
        return res.status(404).json({ error: 'Hive not found.' });
      }

      // Insert the health record into the HiveHealth table
      const sql = 'INSERT INTO HiveHealth (hive_id, temperature, humidity, activity_level) VALUES (?, ?, ?, ?)';
      const params = [hive_id, temperature, humidity, activity_level];
      database.run(sql, params, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to create health record. Please try again later.' });
        }

        console.log("New health record created for hive: " + hive_id);

        // If creation is successful, return a success response
        res.status(200).json({ message: 'Health record creation successful.' });
      });
    });
  });

  /* PUT update an existing health record for a hive */
  router.put('/:id', authMiddleware, (req, res, next) => { // Pragmatically incorrect, should also be a patch method instead of put, low priority bugfix
    const health_id = req.params.id;
    const { temperature, humidity, activity_level } = req.body;

    // Validate that at least one parameter is provided
    if (!temperature && !humidity && !activity_level) {
      return res.status(400).json({ error: 'At least one parameter must be provided for update.' });
    }

    // Construct the update query based on provided parameters
    let sql = 'UPDATE HiveHealth SET';
    const params = [];

    // Check for what we're trying to update
    if (temperature) {
      sql += ' temperature = ?,';
      params.push(temperature);
    }

    if (humidity) {
      sql += ' humidity = ?,';
      params.push(humidity);
    }

    if (activity_level) {
      sql += ' activity_level = ?,';
      params.push(activity_level);
    }

    // Remove trailing comma and add WHERE clause
    sql = sql.slice(0, -1) + ' WHERE health_id = ?';
    params.push(health_id);

    // Execute the update query
    database.run(sql, params, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update health record. Please try again later.' });
      }

      console.log("Health record updated: " + health_id);

      // If update is successful, return a success response
      res.status(200).json({ message: 'Health record update successful.' });
    });
  });

  /* DELETE delete a health record for a hive */
  router.delete('/:id', authMiddleware, (req, res, next) => {
    const health_id = req.params.id;

    // Delete the health record from the HiveHealth table
    const sql = 'DELETE FROM HiveHealth WHERE health_id = ?';
    database.run(sql, health_id, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete health record. Please try again later.' });
      }

      console.log("Health record deleted: " + health_id);

      // If deletion is successful, return a success response
      res.status(200).json({ message: 'Health record deletion successful.' });
    });
  });

  return router;
};
