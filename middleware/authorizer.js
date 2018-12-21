const AuthorizationError = require('../util/AuthorizationError');

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.isAdmin !== true) {
    const err = new AuthorizationError();
    next(err);
  } else {
    next();
  }
};

module.exports = isAdmin;
