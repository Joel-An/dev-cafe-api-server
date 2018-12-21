const TokenManager = require('../util/token');
const TokenError = require('../util/TokenError');

exports.deserializer = (req, res, next) => {
  const tokenManger = new TokenManager();
  const token = req.get('x-access-token');

  if (!token) {
    return next();
  }

  const getDecoded = tokenManger.decodeToken(token);

  return getDecoded
    .then((decoded) => {
      req.user = decoded;
      next();
    })
    .catch((err) => {
      next(err);
    });
};

exports.isAuthenticated = (req, res, next) => {
  if (!req.user) {
    const err = new TokenError({ message: '로그인 후 이용해주세요.' });
    next(err);
  } else {
    next();
  }
};
