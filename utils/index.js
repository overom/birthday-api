const bcrypt = require("bcryptjs");

/**
 * Hash password
 * @param {*} password
 */
const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

/**
 * Compare password
 */
const comparePassword = (candidatePassword, trustedPassword) => {
  return bcrypt.compareSync(candidatePassword, trustedPassword);
};

export const htmlEncoded = (value) => {
  const htmlCharMap = {
    "'": "&#39;",
    '"': "&quot;",
    "<": "&lt;",
    ">": "&gt;",
    "\\": "&#x5c;",
    "`": "&#x60;",
    ":": "&#58",
  };
  const encodeHTMLmapper = (ch) => htmlCharMap[ch];
  return value.replace(/[&"'<>\\`:]/g, encodeHTMLmapper);
};

module.exports = {
  hashPassword,
  comparePassword,
  htmlEncoded,
};
