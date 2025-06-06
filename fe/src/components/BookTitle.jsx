import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Star } from 'lucide-react';
import '../App.scss';

export const BookTitle = ({ title, averageRating, book, bookId, currentUser }) => {
  // console.log('=== BookTitle 렌더링 ===');
  // console.log('전달받은 book 객체:', book);
  // console.log('book?.avg:', book?.avg);
  // console.log('book?.id:', book?.id);
  // console.log('averageRating:', averageRating);
  // console.log('typeof book?.avg:', typeof book?.avg);
  
  const [userRating, setUserRating] = useState(0); // 사용자가 준 별점
  const [hoverRating, setHoverRating] = useState(0); // 호버 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // book 객체에서 데이터 추출
  const bookTitle = book?.title || title || "책 제목을 불러오는 중...";
  const actualBookId = book?.id || bookId;
  
  const rawRating = book?.avg !== undefined && book?.avg !== null ? book.avg : averageRating;
  // console.log('rawRating 계산 결과:', rawRating);
  const bookRating = !isNaN(parseFloat(rawRating)) ? parseFloat(rawRating) : 0;
  // console.log('최종 bookRating:', bookRating);
  
  // 소수점 첫째 자리까지 표시
  const formattedRating = bookRating.toFixed(1);
  const fullStars = Math.floor(bookRating);
  
  // API URL
  const API_URL = process.env.REACT_APP_API_URL || '';
  
  // 🔧 book이 바뀔 때마다 상태 초기화
  useEffect(() => {
    // console.log('📚 새로운 book으로 변경됨:', book?.title, 'ID:', book?.id);
    // console.log('📊 새로운 avg 값:', book?.avg);
    
    // book이 바뀌면 관련 상태들 초기화
    setUserRating(0);
    setHoverRating(0);
    setIsSubmitting(false);
  }, [book?.id, book?.avg]); // book.id와 book.avg가 바뀔 때마다 실행
  
  // 🔧 사용자의 기존 별점 조회 (무한 루프 방지)
  useEffect(() => {
    const fetchUserRating = async () => {
      // 필수 조건 체크
      if (!actualBookId || !currentUser?.user_id || !API_URL) {
        // console.log('📍 별점 조회 조건 미충족:', { 
        //   actualBookId, 
        //   currentUserId: currentUser?.user_id, 
        //   API_URL: !!API_URL 
        // });
        setUserRating(0); // 조건 미충족시 0으로 설정
        return;
      }

      try {
        // console.log(`🔍 사용자 별점 조회 시작: 책 ${actualBookId}, 사용자 ${currentUser.user_id}`);
        
        const response = await fetch(`${API_URL}/api/books/${actualBookId}/user-rating?userId=${currentUser.user_id}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setUserRating(data.data.rating);
            // console.log(`✅ 기존 별점 발견: ${data.data.rating}점`);
          } else {
            setUserRating(0); // 기존 별점 없음
            // console.log('📝 기존 별점 없음');
          }
        } else {
          // console.warn('별점 조회 실패:', response.status);
          setUserRating(0);
        }
      } catch (error) {
        // console.error('사용자 별점 조회 오류:', error);
        setUserRating(0);
      }
    };

    fetchUserRating();
  }, [actualBookId, currentUser?.user_id, API_URL]); // 🔧 user_id로 수정
  
  // 별점 제출 (무한 루프 방지 로직 추가)
  const handleRatingSubmit = async (rating) => {
    // 🔧 중복 호출 방지
    if (!currentUser?.user_id || !actualBookId || isSubmitting) {
      console.warn('⚠️ 별점 제출 조건 미충족:', { 
        currentUserId: currentUser?.user_id, 
        actualBookId, 
        isSubmitting 
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // console.log(`⭐ 별점 제출 시작: ${rating}점 (책 ID: ${actualBookId})`);
      
      const response = await fetch(`${API_URL}/api/books/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: actualBookId,
          userId: currentUser.user_id,
          rating: rating
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setUserRating(rating);
        // console.log(`✅ 별점 ${rating}점이 성공적으로 저장되었습니다.`);
        
        // 🔧 이벤트 발생을 한 번만 실행
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('bookRatingUpdated', { 
            detail: { bookId: actualBookId, rating } 
          }));
        }
      } else {
        console.error('별점 저장 실패:', result.message);
        alert('별점 저장에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('별점 저장 오류:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 별점 삭제 (무한 루프 방지)
  const handleRatingReset = async () => {
    if (!currentUser?.user_id || !actualBookId || userRating === 0 || isSubmitting) {
      console.warn('⚠️ 별점 삭제 조건 미충족');
      return;
    }

    if (!window.confirm('별점을 삭제하시겠습니까?')) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // console.log('🗑️ 별점 삭제 시작');
      
      const response = await fetch(`${API_URL}/api/books/${actualBookId}/rating`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.user_id
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setUserRating(0);
        // console.log('✅ 별점이 성공적으로 삭제되었습니다.');
        
        // 🔧 이벤트 발생
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('bookRatingUpdated', { 
            detail: { bookId: actualBookId, rating: 0 } 
          }));
        }
      } else {
        console.error('별점 삭제 실패:', result.message);
        alert('별점 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('별점 삭제 오류:', error);
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card.Header className="bg-light">
      <div className="d-flex align-items-center justify-content-between flex-wrap">
        <div className="d-flex align-items-center flex-wrap">
          <h5 className="mb-0 me-3 kakaobooktitle">{bookTitle}</h5>
          
          {/* 평균 별점 표시 */}
          <div className="d-flex align-items-center me-3">
            <div className="d-flex text-warning me-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  color="#FFC107"
                  fill={star <= bookRating ? "#FFC107" : "none"}
                  stroke="#FFC107"
                  strokeWidth={1}
                  style={{ marginRight: 2 }}
                />
              ))}
            </div>
            <span className="text-muted"> {formattedRating}</span>
            <small className="text-muted ms-1">(평균)</small>
          </div>
        </div>
        
        {/* 사용자 별점 주기 */}
        {currentUser && (
          <div className="d-flex align-items-center">
            <small className="text-muted me-2">내 별점:</small>
            
            {/* 별점 입력 UI */}
            <div className="d-flex align-items-center me-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  className="me-1"
                  color={star <= (hoverRating || userRating) ? "#FFB900" : "#ADB5BD"}
                  fill={star <= (hoverRating || userRating) ? "#FFB900" : "none"}
                  onClick={() => handleRatingSubmit(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{ 
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.6 : 1
                  }}
                  title={`${star}점 주기`}
                />
              ))}
            </div>
            
            {/* 현재 별점 표시 */}
            {userRating > 0 && (
              <Badge bg="primary" className="me-2">
                {userRating}★
              </Badge>
            )}
            
            {/* 별점 삭제 버튼 */}
            {userRating > 0 && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleRatingReset}
                disabled={isSubmitting}
                style={{ fontSize: '8px' , padding:'4px'}}
              >
                삭제
              </Button>
            )}
            
            {/* 로딩 상태 */}
            {isSubmitting && (
              <small className="text-muted ms-2">저장 중...</small>
            )}
          </div>
        )}
        
        {!currentUser && (
          <small className="text-muted">로그인하면 별점을 줄 수 있습니다</small>
        )}
      </div>
    </Card.Header>
  );
};

export default BookTitle;