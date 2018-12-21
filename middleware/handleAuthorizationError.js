const AuthorizationError = require('../util/AuthorizationError');

exports.handleAuthorizationError = (err, req, res, next) => {
  if (err instanceof AuthorizationError) {
    res.status(403);
    return res.json(err);
  }
  return next(err);
};
