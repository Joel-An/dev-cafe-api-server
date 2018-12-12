const USER = {
  ERROR: {
    WRONG_COMFIRM_PASSWORD: '비밀번호가 일치하지 않습니다.',
    INVALID_PASSWORD:
      '비밀번호는 8~20자리 알파벳,숫자,특수문자를 조합해야합니다.',
    INVALID_EMAIL: '이메일 형식이 틀렸습니다.',
    INVALID_USERNAME:
      '사용자 이름은 2~20자리, 하이픈(-)을 제외한 특수문자는 포함할 수 없습니다.',
    INVALID_PROFILENAME: '프로필 이름은 20자를 초과할 수 없습니다.',
    EMPTY_USERINFO: '필수 항목을 입력하지 않았습니다.',
    DUPLICATED_USERINFO: "동일한 '사용자 이름' 또는 '이메일'이 존재합니다.",
  },
};

const AUTH = {
  ERROR: {
    WRONG_USERNAME: '존재하지 않는 사용자이름/이메일입니다.',
    WRONG_PASSWORD: '비밀번호가 일치하지 않습니다.',
  },
};

module.exports = {
  USER,
  AUTH,
};
