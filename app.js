/*
 *     HiveHelper
 *     (c) Joey Manani 2024
 *     Version 1.0.0-LivePatch
 * 
 *     Licensed under the Joey Manani License <https://cdn.theflyingrat.com/LICENSE>
 * 
 *     Dedicated for Richard Smith, beekeeper.
 * 
 *     Permission is hereby granted, free of charge, to any person obtaining a copy of this software for use in education contexts without restriction
 *     This software is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     All methods implemented in this software are as a PROOF OF CONCEPT and are not expected to be used in a production environment
 * 
*/

// Import dependencies 
const express = require('express');                                      // HTTP server for nodejs
const path = require('path');                                            // Access to the server's file system
const crypto = require('crypto');                                        // Ability to generate randombytes for security
const cookieParser = require('cookie-parser');                           // Ability for express to parse cookie data and thus;
const session = require('express-session');                              // the ability to manage user sessions with login tokens
const { sanitizeUserInputs } = require('./middleware/sanitize.js');      // Ensure all user input is safe and valid
const MemoryStore = require('memorystore')(session);                     // Store the user sessions in RAM. App is small scale, and does not need a redis server
const logger = require('morgan');                                        // Logging server activity
const sqlite3 = require('sqlite3');                                      // Ability to access the database

// Load the database
const database = new sqlite3.Database('database.sqlite', (err) => {
  if (err) {
    // Quit the process if I couldn't connect to the DB
    console.error("[FAIL] " + err.message);
    process.exit(1);
  }
  console.log('[INFO] Connected to the database.');
});


// Import routes
const indexRouter = require('./routes/index.js')(database);
const registerRouter = require('./routes/register.js')(database);
const loginRouter = require('./routes/login.js')(database);
const hiveRouter = require('./routes/hive.js')(database);
const hiveHealthRouter = require('./routes/hiveHealth.js')(database);
const tasksRouter = require('./routes/tasks.js')(database);

// Declare a new express server application
const app = express();

// Set a html view engine for rendering the static pages, here we are using ejs
app.set('view engine', 'ejs');

// Add some middlewares
app.use(logger('dev')); // dev mode logs to standard output
app.use(express.urlencoded({ extended: false }));
app.use(express.json({limit: "1kb"})); 
app.use(cookieParser());
app.use(sanitizeUserInputs); // Security
app.use(express.static(path.join(__dirname, 'public'))); // Everything in the public directory is static
app.use(session({secret: crypto.randomBytes(64).toString('hex'), resave: false, saveUninitialized: true, store: new MemoryStore({ checkPeriod: 86400000 }), cookie: {maxAge: 3600000 }})); // Sessions for managing user logins. Valid for one hour 


// Declare routes
app.use('/', indexRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/hive', hiveRouter);
app.use('/health', hiveHealthRouter);
app.use('/tasks', tasksRouter);


// Declare a static route for performance testing with self embedded middleware
app.get("/ping", (req, res, next) => { req.startTime = performance.now(); next(); }, (req, res) => {
  const elapsedTime = performance.now() - req.startTime;
  res.status(200).json( { code: 200, status: "Pong!", additional_information: `I took ${elapsedTime.toFixed(3)} ms to handle your request!`} );
  return;
});



// Run the app on localhost:3000
app.listen(3000, '127.0.0.1', () => {
  console.log("[INFO] Listening on http://localhost:3000")
})

// joeymanani@joeymanani.com
// password123


// r.smith@gmail.com
// happybees4