// utils/kakao.util.js
const axios = require('axios');
const kakaoConfig = require('../config/kakao.config');

/**
 * 카카오 로그인 인증 URL 생성
 */
const getKakaoAuthUrl = () => {
  return `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoConfig.restApiKey}&redirect_uri=${kakaoConfig.redirectUri}&response_type=code`;
};

/**
 * 카카오 액세스 토큰 요청
 * @param {string} code 카카오 인증 코드
 */
const getKakaoToken = async (code) => {
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://kauth.kakao.com/oauth/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        grant_type: 'authorization_code',
        client_id: kakaoConfig.restApiKey,
        redirect_uri: kakaoConfig.redirectUri,
        code,
        client_secret: kakaoConfig.clientSecret
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('카카오 토큰 요청 중 오류 발생:', error.response?.data || error.message);
    throw new Error('카카오 로그인 처리 중 오류가 발생했습니다');
  }
};

/**
 * 카카오 사용자 정보 요청
 * @param {string} accessToken 카카오 액세스 토큰
 */
const getKakaoUserInfo = async (accessToken) => {
  try {
    const response = await axios({
      method: 'GET',
      url: 'https://kapi.kakao.com/v2/user/me',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('카카오 사용자 정보 요청 중 오류 발생:', error.response?.data || error.message);
    throw new Error('카카오 사용자 정보 조회 중 오류가 발생했습니다');
  }
};

/**
 * 카카오 로그아웃
 * @param {string} accessToken 카카오 액세스 토큰
 */
const kakaoLogout = async (accessToken) => {
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://kapi.kakao.com/v1/user/logout',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('카카오 로그아웃 중 오류 발생:', error.response?.data || error.message);
    throw new Error('카카오 로그아웃 처리 중 오류가 발생했습니다');
  }
};

/**
 * 카카오 연결 끊기
 * @param {string} accessToken 카카오 액세스 토큰
 */
const unlinkKakao = async (accessToken) => {
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://kapi.kakao.com/v1/user/unlink',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('카카오 연결 끊기 중 오류 발생:', error.response?.data || error.message);
    throw new Error('카카오 연결 끊기 처리 중 오류가 발생했습니다');
  }
};

/**
 * 카카오 책 검색 API
 * @param {string} query 검색어
 * @param {number} page 페이지 번호 (기본값: 1)
 * @param {number} size 페이지당, 결과 수 (기본값: 10, 최대: 50)
 */
const searchBooks = async (query, page = 1, size = 10) => {
  try {
    const response = await axios({
      method: 'GET',
      url: 'https://dapi.kakao.com/v3/search/book',
      headers: {
        Authorization: `KakaoAK ${kakaoConfig.restApiKey}`
      },
      params: {
        query,
        page,
        size
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('카카오 책 검색 중 오류 발생:', error.response?.data || error.message);
    throw new Error('카카오 책 검색 중 오류가 발생했습니다');
  }
};

module.exports = {
  getKakaoAuthUrl,
  getKakaoToken,
  getKakaoUserInfo,
  kakaoLogout,
  unlinkKakao,
  searchBooks
};