// auth.js
// Copyright (c) 2024 Joey Manani <https://cdn.theflyingrat.com/LICENSE>
// Micro middleware to ensure user is logged in

module.exports = (req, res, next) => {
    if (req.session && req.session.beekeeper_id) {
        // Check for session, if so, go to the next part of the code
        next();
    } else {
        // Redirect user back to login if I couldn't find their session
        // TODO: add a query param of the current url, so after user logs in, auto redirect to the page that caused this invalid session
        res.redirect("/login");
        //res.status(401).json({ error: 'Unauthorized. Please log in.' });
        // Uncomment the above line if using in API only mode
    }
};