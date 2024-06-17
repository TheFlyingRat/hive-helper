// tasks.js
// Copyright (c) 2024 Joey Manani <https://cdn.theflyingrat.com/LICENSE>
// API routes for Tasks

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

module.exports = (database) => {
  /* GET retrieve tasks */
  router.get('/', (req, res, next) => {
    const { hive_id } = req.body;

    // Prepare sql command
    let sql = 'SELECT * FROM Tasks';
    const params = [];

    if (hive_id) {
      sql += ' WHERE hive_id = ?';
      params.push(hive_id);
    }

    // Order tasks by due data, user does not see this unless they're accessing the data directly from the API
    sql += ' ORDER BY due_date';

    database.all(sql, params, (err, tasks) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to retrieve tasks. Please try again later.' });
      }

      // No tasks found
      if (tasks.length === 0 && hive_id) {
        return res.status(404).json({ error: 'No tasks found for hive #' + hive_id });
      }

      // Otherwise, return all tasks sorted by due date
      res.status(200).json(tasks);
    });
  });

  /* POST create a new task */
  router.post('/', authMiddleware, (req, res, next) => {
    const { hive_id, task_description, due_date } = req.body;
    const beekeeper_id = req.session.beekeeper_id;

    // Validate that all required parameters are present
    if (!hive_id || !task_description || !due_date) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    // Check if the hive_id exists in the Hives table
    database.get('SELECT * FROM Hives WHERE hive_id = ?', [hive_id], (err, hive) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create task. Please try again later.' });
      }

      if (!hive) {
        return res.status(404).json({ error: 'Hive not found.' });
      }

      // Insert the task data into the table
      const sql = 'INSERT INTO Tasks (hive_id, task_description, due_date) VALUES (?, ?, ?)';
      const params = [hive_id, task_description, due_date];
      database.run(sql, params, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to create task. Please try again later.' });
        }

        console.log("New task created for hive: " + hive_id);

        // If creation is successful, return a success response
        res.status(200).json({ message: 'Task creation successful.' });
      });
    });
  });

  /* PUT update an existing task */
  router.put('/:task_id', authMiddleware, (req, res, next) => { // TODO: This is pragmatically incorrect. Should be a patch method rather than put.. Low priority.
    const { task_id } = req.params;
    const { task_description, due_date, completed } = req.body;

    // Validate that all required parameters are present
    if (!task_description && !due_date && !completed) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    // Prepare sql command to update
    let sql = 'UPDATE Tasks SET ';
    const params = [];

    // Checks what we have to update
    if (task_description) {
      sql += 'task_description = ?, ';
      params.push(task_description);
    }
    if (due_date) {
      sql += 'due_date = ?, ';
      params.push(due_date);
    }
    if (completed !== undefined) {
      sql += 'completed = ?, ';
      params.push(completed);
    }

    // Remove the trailing comma and space
    sql = sql.slice(0, -2);

    sql += ' WHERE task_id = ?';
    params.push(task_id);

    database.run(sql, params, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update task. Please try again later.' });
      }

      console.log("Task updated: " + task_id);

      // If update is successful, return a success response
      res.status(200).json({ message: 'Task update successful.' });
    });
  });

  /* DELETE delete an existing task */
  router.delete('/:task_id', authMiddleware, (req, res, next) => {
    const { task_id } = req.params;

    // Delete the task from the Tasks table
    const sql = 'DELETE FROM Tasks WHERE task_id = ?';
    database.run(sql, task_id, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete task. Please try again later.' });
      }

      // Tasks do not belong to anyone, they're global - so they belong to all users. This could be improved (personal tasks) if Richard wanted in future
      console.log("Task deleted: " + task_id);

      // If deletion is successful, return a success response
      res.status(200).json({ message: 'Task deletion successful.' });
    });
  });

  return router;
};
