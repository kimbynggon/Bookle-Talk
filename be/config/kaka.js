require('dotenv').config();

module.exports = {
  restApiKey: process.env.KAKAO_REST_API_KEY,
  redirectUri: process.env.KAKAO_REDIRECT_URI,
  apiUrl: 'https://kapi.kakao.com',
  authUrl: 'https://kauth.kakao.com'
};