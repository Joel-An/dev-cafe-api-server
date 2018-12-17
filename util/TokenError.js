class TokenError extends Error {
  constructor(message, name, ...rest) {
    super();
    this.message = message;
    this.name = name;
    this.info = rest;
  }
}

module.exports = TokenError;
