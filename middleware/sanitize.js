// sanitize.js
// Copyright (c) 2024 Joey Manani <https://cdn.theflyingrat.com/LICENSE>
// Sanitize all given user inputs


const sanitizeHtml = require('sanitize-html');

const sanitizeUserInputs = (req, res, next) => {
  // Loop through req.body, req.query, and req.params to sanitize user inputs
  [req.body, req.query, req.params].forEach((input) => {
    if (input) {
      sanitizeObject(input);
    }
  });

  next();
};

const sanitizeObject = (obj) => {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key]);
    }
  }
};


const sanitizeString = (str) => {
  return sanitizeHtml(str, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'recursiveEscape'
  })
};

module.exports = { sanitizeUserInputs, sanitizeString };
