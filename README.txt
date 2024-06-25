================================================================

HiveHelper
(c) Joey Manani 2024
Version 1.0.0-LivePatch

Licensed under the Joey Manani License <https://cdn.theflyingrat.com/LICENSE>
Dedicated for Richard Smith, beekeeper.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software for use in education contexts without restriction
This software is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
All methods implemented in this software are as a PROOF OF CONCEPT and are not expected to be used in a production environment

================================================================


Production app can be found at https://hivehelper.theflyingrat.com

To run locally:
1. Please install `Nodejs v21.0.0` (https://nodejs.org/dist/v21.0.0/win-x64/node.exe)
2. Reload environment and then install all packages with `npm install`
3. Once npm has finished installing packages, run `node app.js` in the current working directory

Default logins can be found at the bottom of app.js

After starting the app, either use a default login or create a new account
The GUI shows the rest of available information
The columns of the Hives page can be sorted by clicking their column title, either asc or desc, alphabetically
Live health information is dummy data, as hive sensors are out of scope until Richard implements them in his hives
All information in the current database is for development, it is not real data

===============================================================

app.js contains the Expressjs server configuration for both the frontend and backend.
It references all the routes found in the /routes/ directory.
Please see all comments inside of app.js as well as all routes for information of what's happening behind the scenes

The /views/ directory contains all elements that the user will see. This is the front end and is written in ejs, a superset of html.
It references other files from the /partials/ directory, including the navbar


===============================================================

Required criteria:

• validating user input                                     This can be found in all api endpoints, as an existence check is required to ensure the user passes the required parameters (middleware/sanitize.js also ensures user data is valid)
• storing and retrieving data                               The file `database.sqlite` is a sql database that contains all user, and related hive data
• searching data                                            When a user logs in, the database is searched for the user to retrieve their password hash, this is a linear search and scales in O(n) 
• sorting data                                              The front end file, /public/scripts/hives.js contains the methods: quickSort and sortTable. This implements Quicksort which is used when sorting the column names in the /hives page
• producing useful output                                   The software requirement meets Richard's purpose, so the software is useful
• having a high quality user interface                      The user interface is mobile friendly, and the navbar condenses into a hamburger menu on small viewports. The app is minimalistic, highly-readable and uses a honey accent color to fit the theme
• being efficient and effective                             As the software uses quickSort, searching is efficient. As not many users will be using this app since its private, linear search is okay when searching such a small amount of user accounts
• managing security and accessibility.                      The software is using argon2 password hashing, as well as prevention of sql injections and xss exploits (middleware/sanitize.js). The software adheres to privacy protection laws and implements no methods of tracking. The software is accessible on mobile devices.

==============================================================

HiveHelper - A school project