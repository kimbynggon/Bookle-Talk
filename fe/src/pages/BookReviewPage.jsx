// fe > src > pages > bookreviewpage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import BookTitle from '../components/BookTitle.jsx';
import BookCover from '../components/BookCover.jsx';
import ChatSection from '../components/ChatSection.jsx';
import BookSummary from '../components/BookSummary.jsx';
import BookInfo from '../components/BookInfo.jsx';
import '../App.css';

// 🆕 더미 사용자 데이터 (컴포넌트 외부로 이동하여 의존성 문제 해결)
const DUMMY_USERS = [
  { id: 1, user_id: 'user001', nickname: '책읽는호랑이' },
  { id: 2, user_id: 'user002', nickname: '문학소녀' },
  { id: 3, user_id: 'user003', nickname: '북마니아' },
  { id: 4, user_id: 'user004', nickname: '소설탐험가' },
  { id: 5, user_id: 'user005', nickname: '역사학자' }
];

export default function BookReviewPage() {
  const { id } = useParams(); 
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 🆕 현재 사용자 상태 추가
  const [currentUser, setCurrentUser] = useState(null);

  // 🆕 API URL 설정 (환경변수 사용)
  const API_URL = process.env.REACT_APP_API_URL || '';

  // 🔧 현재 사용자 설정 (무한 루프 방지)
  useEffect(() => {
    // 🔧 이미 사용자가 설정되어 있다면 중복 설정 방지
    if (currentUser) {
      console.log('👤 BookReviewPage - 사용자 이미 설정됨:', currentUser.nickname);
      return;
    }

    // 임시로 랜덤 사용자 선택 또는 고정 사용자 사용
    const randomUser = DUMMY_USERS[Math.floor(Math.random() * DUMMY_USERS.length)];
    // 또는 고정 사용자 사용: const fixedUser = DUMMY_USERS[0];
    
    setCurrentUser(randomUser);
    // console.log('🧪 BookReviewPage - 임시 사용자 설정:', randomUser);
  }, []); // 🔧 빈 의존성 배열로 한 번만 실행

  // 🆕 책 평점 업데이트 이벤트 리스너 (무한 루프 방지)
  useEffect(() => {
    const handleRatingUpdate = async (event) => {
      const { bookId } = event.detail;
      
      // 🔧 조건 체크 강화
      if (!book || !book.id || book.id !== bookId || !id || !API_URL) {
        console.log('📍 평점 업데이트 조건 미충족:', { 
          hasBook: !!book, 
          bookId: book?.id, 
          eventBookId: bookId,
          pageId: id
        });
        return;
      }
      
      console.log(`📊 책 ${bookId}의 평점이 업데이트됨 - 데이터 새로고침 시작`);
      
      try {
        const apiUrl = `${API_URL}/api/books/${id}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (response.ok && data.success) {
          setBook(data.data);
          console.log('✅ 평점 업데이트 후 책 데이터 새로고침 완료');
        } else {
          console.warn('⚠️ 평점 업데이트 후 데이터 새로고침 실패:', data.message);
        }
      } catch (error) {
        console.error('❌ 평점 업데이트 후 데이터 새로고침 실패:', error);
      }
    };

    window.addEventListener('bookRatingUpdated', handleRatingUpdate);
    
    return () => {
      window.removeEventListener('bookRatingUpdated', handleRatingUpdate);
    };
  }, [book?.id, id, API_URL]); // 🔧 의존성 배열 최소화

  // 책 데이터 가져오기
  useEffect(() => {
    const fetchBook = async () => {
      if (!id) {
        setError('책 ID가 제공되지 않았습니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // 🔧 API URL 수정 (환경변수 사용)
        const apiUrl = `${API_URL}/api/books/${id}`;
        // console.log(`📚 책 데이터 요청: ${apiUrl}`);
        
        const response = await fetch(apiUrl); 
        const data = await response.json();

        // console.log('📚 API 응답:', data);

        if (response.ok && data.success) {
          setBook(data.data);
          // console.log('✅ 책 데이터 로드 성공:', data.data.title);
        } else {
          throw new Error(data.message || `책을 찾을 수 없습니다. (상태코드: ${response.status})`);
        }
      } catch (err) {
        console.error('❌ 책 데이터 로드 실패:', err);
        setError(`책 정보를 불러오는 데 실패했습니다: ${err.message || '알 수 없는 오류'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, API_URL]); // 의존성 배열에 API_URL 추가 

  // 로딩 상태
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">책 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 책 데이터가 없는 경우
  if (!book) {
    return (
      <Alert variant="warning" className="text-center">
        <Alert.Heading>책을 찾을 수 없습니다</Alert.Heading>
        <p>요청하신 책 정보를 찾을 수 없습니다. (ID: {id})</p>
      </Alert>
    );
  }

  return (
    <Card className="">
      <BookTitle 
        title={book.title}
        averageRating={book.avg || book.average_rating || 0}
        book={book}
        bookId={parseInt(id)}
        currentUser={currentUser}  
      />

      <Card.Body>
        <Row>
          {/* 책 표지 이미지 */}
          <Col md={4} className="mb-3 mb-md-0">
            <BookCover book={book} />
          </Col>

          {/* 중앙 컨텐츠 */}
          <Col md={8}>
            <Row>
              {/* 책 줄거리 */}
              <Col md={12} className="mb-4">
                <BookSummary book={book} />
              </Col>

              {/* 도서 정보 */}
              <Col md={12} className="">
                <BookInfo book={book} />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col md={12}>
            <ChatSection bookId={parseInt(id)} />
          </Col>
        </Row>

        {/* 디버그 정보 (개발 환경에서만) - 🆕 currentUser 정보 추가 */}
        {process.env.NODE_ENV === 'development' && (
          <Row className="mt-3">
            <Col md={12}>
              <Card className="bg-light">
                <Card.Header>
                  <small className="text-muted">🔧 개발자 정보</small>
                </Card.Header>
                <Card.Body>
                  <small>
                    <strong>Book ID:</strong> {id}<br/>
                    <strong>Book Title:</strong> {book.title}<br/>
                    <strong>Average Rating:</strong> {book.avg || 'N/A'}<br/>
                    <strong>Author:</strong> {book.author || 'N/A'}<br/>
                    <strong>Current User:</strong> {currentUser ? `${currentUser.nickname} (ID: ${currentUser.id})` : 'Loading...'}<br/>
                    <strong>API URL:</strong> {API_URL || 'Default (proxy)'}
                  </small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
}