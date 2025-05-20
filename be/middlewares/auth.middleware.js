// middlewares/auth.middleware.js - 인증 미들웨어

const jwt = require('jsonwebtoken');
const { pool } = require('../database/init');

/**
 * JWT 인증 미들웨어
 * 요청 헤더에서 토큰을 검증하고 사용자 정보를 요청 객체에 추가
 */
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token'] || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(403).json({
        success: false,
        message: '인증 토큰이 제공되지 않았습니다.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 데이터베이스에서 사용자 확인
    const userResult = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [decoded.id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '토큰에 해당하는 사용자를 찾을 수 없습니다.'
      });
    }
    
    // 요청 객체에 사용자 정보 추가
    req.user = {
      id: userResult.rows[0].id,
      username: userResult.rows[0].username,
      email: userResult.rows[0].email,
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 만료되었습니다.'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: '유효하지 않은 인증 토큰입니다.'
    });
  }
};

/**
 * 선택적 인증 미들웨어
 * 토큰이 있으면 검증하고, 없으면 게스트로 진행
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token'] || req.headers.authorization?.split(' ')[1];

    if (!token) {
      req.user = null; // 게스트 사용자
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 데이터베이스에서 사용자 확인
      const userResult = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [decoded.id]);
      
      if (userResult.rows.length > 0) {
        req.user = {
          id: userResult.rows[0].id,
          username: userResult.rows[0].username,
          email: userResult.rows[0].email,
        };
      } else {
        req.user = null;
      }
    } catch (error) {
      req.user = null; // 토큰이 유효하지 않은 경우 게스트 사용자로 설정
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyToken,
  optionalAuth
};