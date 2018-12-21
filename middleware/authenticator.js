const TokenManager = require('../util/token');

exports.isAuthenticated = (req, res, next) => {
  const tokenManger = new TokenManager();
  const token = req.get('x-access-token');

  const getDecoded = tokenManger.decodeToken(token);

  getDecoded
    .then((decoded) => {
      req.user = decoded;
      next();
    })
    .catch((err) => {
      next(err);
    });
};
