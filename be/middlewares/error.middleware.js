// middlewares/error.middleware.js - 에러 처리 미들웨어

/**
 * 에러 처리 미들웨어
 * 애플리케이션에서 발생하는 모든 에러를 처리
 */
module.exports = (err, req, res, next) => {
    console.error(`에러 발생: ${err.message}`);
    console.error(err.stack);
    
    // 응답이 이미 전송된 경우
    if (res.headersSent) {
      return next(err);
    }
    
    // 에러 타입에 따른 응답 처리
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: '유효성 검사 오류',
        errors: err.errors
      });
    }
    
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({
        success: false,
        message: '인증 오류',
        error: err.message
      });
    }
    
    if (err.name === 'ForbiddenError') {
      return res.status(403).json({
        success: false,
        message: '권한 없음',
        error: err.message
      });
    }
    
    if (err.name === 'NotFoundError') {
      return res.status(404).json({
        success: false,
        message: '리소스 없음',
        error: err.message
      });
    }
    
    // 기본 에러 응답
    return res.status(err.status || 500).json({
      success: false,
      message: '서버 오류가 발생했습니다',
      error: process.env.NODE_ENV === 'production' ? '서버 오류' : err.message
    });
  };