const TokenError = require('../util/TokenError');

exports.handleTokenError = (err, req, res, next) => {
  if (err instanceof TokenError) {
    res.status(401);
    res.json(err);
  }
  next(err);
};
