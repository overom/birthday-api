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
  

  module.exports = {
    hashPassword,
    comparePassword,
  
  };
  