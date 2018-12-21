class AuthorizationError extends Error {
  constructor(message) {
    super();
    this.message = message || '권한이 없어 거부되었습니다.';
  }
}

module.exports = AuthorizationError;
