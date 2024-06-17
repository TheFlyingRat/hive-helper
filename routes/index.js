// index.js
// Copyright (c) 2024 Joey Manani <https://cdn.theflyingrat.com/LICENSE>
// Return an index page to user

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');


// Return static routes, can be found in 'views' directory. Written in modified html called ejs. Allows embedded javascript for dynamic pages.
module.exports = (database) => {
  /* GET index, redirect to /home */
  router.get('/', (req, res, next) => {
    res.redirect('/home');
  });
  /* GET home page. */
  router.get('/home', authMiddleware, (req, res, next) => {
    res.render('home', { title: "Home", username: req.session.name });
  });
  /* Get login page. */
  router.get('/login', (req, res, next) => {
    res.render('login', { title: "Log In" });
  });
  /* GET signup page. */
  router.get('/signup', (req, res, next) => {
    res.render('signup', { title: "Sign Up" });
  });
  /* GET livehealth page. */
  router.get('/livehealth', authMiddleware, (req, res, next) => {
    res.render('livehealth', { title: "Live Health" });
  });
  /* GET hives page. */
  router.get('/hives', authMiddleware, (req, res, next) => {
    res.render('hives', { title: "Hives" });
  });
  /* GET schedule page. */
  router.get('/schedule', authMiddleware, (req, res, next) => {
    res.render('schedule', { title: "Schedule" });
  });
  /* GET logout page. */
  router.get('/logout', authMiddleware, (req, res, next) => {
    // Immediately destroy the user session
    req.session.destroy();
    res.redirect('/login');
  });


  return router;
}
