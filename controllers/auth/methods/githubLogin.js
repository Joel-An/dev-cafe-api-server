const axios = require('axios');

const TokenManager = require('../../../util/token');
const User = require('../../../models/user');
const Socket = require('../../../util/Socket');
const { GITHUB_OAUTH_CLIENT_ID, GITHUB_OAUTH_SECRET_KEY } = require('../../../config/config');
const { OAUTH_TYPES } = require('../../../constants/oauth');

const sendLoadingPage = (res) => {
  res.status(200);
  res.send(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <style type="text/css">
      .loading-spinner-container{display:flex;justify-content:center;align-items:center;}
      .loading-spinner{
        margin:2px;width:30px;height:30px;border-radius:50%;
        animation:loading-spinner-spin 1s linear infinite;
        border:2px solid rgba(0,0,0,0.3);border-top:2px solid #000;
      }
      @keyframes loading-spinner-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
      </style>      
    </head>
    <body>
      <div class="loading-spinner-container" style={style}>
        loading... <div class="loading-spinner"/>
      </div>
    </body>
   </html>`);
};

const getGithubAccessToken = async (code, state) => {
  const res = await axios.post('https://github.com/login/oauth/access_token',
    {
      code,
      state,
      client_id: GITHUB_OAUTH_CLIENT_ID,
      client_secret: GITHUB_OAUTH_SECRET_KEY,
    },
    { headers: { Accept: 'application/json' } });

  const accessToken = res.data.access_token;

  return accessToken;
};

const getGithubUserInfo = async (accessToken) => {
  const res = await axios.get(
    'https://api.github.com/user',
    {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    }
  );

  const { login } = res.data;
  const profileName = res.data.name;
  const profilePic = res.data.avatar_url;
  const { email } = res.data;

  return {
    login, profileName, profilePic, email,
  };
};

const findUser = login => User.findOne({ 'oauthProvider.github.login': login });

const registerUser = (githubUserInfo) => {
  const {
    login, profileName, profilePic, email,
  } = githubUserInfo;

  const user = new User({
    profileName,
    profilePic,
    email,
    oauthProvider: {
      github: { login },
    },
  });

  return user.save();
};

const signToken = (user) => {
  const userInfo = user instanceof User ? user.toObject() : user;

  const tokenManager = new TokenManager();
  return tokenManager.signToken(userInfo);
};

module.exports = async (req, res) => {
  const { code, state: socketId } = req.query;

  sendLoadingPage(res);
  Socket.emitOauthLoginInProgress(socketId, OAUTH_TYPES.GITHUB);

  try {
    const oauthToken = await getGithubAccessToken(code, socketId);

    const githubUserInfo = await getGithubUserInfo(oauthToken);

    let user = await findUser(githubUserInfo.login);

    if (!user) {
      user = await registerUser(githubUserInfo);
    }

    const accessToken = await signToken(user);

    Socket.emitOauthLoginSuccess(accessToken, socketId, OAUTH_TYPES.GITHUB);
  } catch (e) {
    Socket.emitOauthLoginFailure(e.message, socketId, OAUTH_TYPES.GITHUB);
  }
};
