import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Star } from 'lucide-react';

export const BookTitle = ({ title, averageRating, book, bookId, currentUser }) => {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // book 객체에서 데이터 추출
  const bookTitle = book?.title || title || "책 제목을 불러오는 중...";
  const actualBookId = book?.id || bookId;
  
  const rawRating = book?.avg !== undefined && book?.avg !== null ? book.avg : averageRating;
  const bookRating = typeof rawRating === 'number' ? rawRating : 0;
  
  const formattedRating = bookRating.toFixed(1);
  const fullStars = Math.floor(bookRating);
  
  const API_URL = process.env.REACT_APP_API_URL || '';
  
  // 사용자의 기존 별점 조회
  useEffect(() => {
    const fetchUserRating = async () => {
      if (!actualBookId || !currentUser?.id || !API_URL) {
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/books/${actualBookId}/user-rating?userId=${currentUser.id}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setUserRating(data.data.rating);
          } else {
            setUserRating(0);
          }
        } else {
          setUserRating(0);
        }
      } catch (error) {
        console.error('사용자 별점 조회 오류:', error);
        setUserRating(0);
      }
    };

    fetchUserRating();
  }, [actualBookId, currentUser?.id, API_URL]);
  
  // 별점 제출
  const handleRatingSubmit = async (rating) => {
    if (!currentUser?.id || !actualBookId || isSubmitting) {
      console.warn('별점 제출 조건 미충족');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_URL}/api/books/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: actualBookId,
          userId: currentUser.id,
          rating: rating
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setUserRating(rating);
        console.log(`✅ 별점 ${rating}점이 성공적으로 저장되었습니다.`);
        
        // 별점 업데이트 이벤트 발생
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
  
  // 별점 삭제
  const handleRatingReset = async () => {
    if (!currentUser?.id || !actualBookId || userRating === 0 || isSubmitting) {
      return;
    }

    if (!window.confirm('별점을 삭제하시겠습니까?')) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_URL}/api/books/${actualBookId}/rating`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setUserRating(0);
        console.log('✅ 별점이 성공적으로 삭제되었습니다.');
        
        // 별점 업데이트 이벤트 발생
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
          <h5 className="mb-0 me-3">{bookTitle}</h5>
          
          {/* 평균 별점 표시 */}
          <div className="d-flex align-items-center me-3">
            <div className="d-flex text-warning me-1">
              {[...Array(fullStars)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
            <span className="text-muted">★ {formattedRating}</span>
            <small className="text-muted ms-1">(평균)</small>
          </div>
        </div>
        
        {/* 사용자 별점 주기 */}
        {currentUser ? (
          <div className="d-flex align-items-center">
            <small className="text-muted me-2">내 별점:</small>
            
            {/* 별점 입력 UI */}
            <div className="d-flex align-items-center me-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  className="me-1 rating-star"
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
                style={{ fontSize: '0.75rem' }}
              >
                삭제
              </Button>
            )}
            
            {/* 로딩 상태 */}
            {isSubmitting && (
              <small className="text-muted ms-2">저장 중...</small>
            )}
          </div>
        ) : (
          <small className="text-muted">로그인하면 별점을 줄 수 있습니다</small>
        )}
      </div>
    </Card.Header>
  );
};

export default BookTitle;