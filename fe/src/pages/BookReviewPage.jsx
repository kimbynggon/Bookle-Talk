import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import BookTitle from '../components/BookTitle.jsx';
import BookCover from '../components/BookCover.jsx';
import ChatSection from '../components/ChatSection.jsx';
import BookSummary from '../components/BookSummary.jsx';
import BookInfo from '../components/BookInfo.jsx';
import '../App.scss';

export default function BookReviewPage({ bookId: propBookId, bookData: propBookData, currentUser: propCurrentUser }) {
  const { id: urlId } = useParams(); 
  const [book, setBook] = useState(propBookData || null);
  const [loading, setLoading] = useState(!propBookData);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(propCurrentUser || null);

  // bookId 결정 (props 우선, URL params 다음)
  const bookId = propBookId || urlId;

  // API URL 설정
  const API_URL = process.env.REACT_APP_API_URL || '';

  // 현재 사용자 정보 가져오기 (props에서 받지 못한 경우)
  useEffect(() => {
    if (!currentUser) {
      const token = localStorage.getItem('token');
      const nickname = localStorage.getItem('nickname');
      
      if (token && nickname) {
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          setCurrentUser({
            id: tokenPayload.id,
            user_id: tokenPayload.user_id,
            nickname: tokenPayload.nickname || nickname
          });
        } catch (error) {
          console.error('토큰 파싱 오류:', error);
        }
      }
    }
  }, [currentUser]);

  // 책 평점 업데이트 이벤트 리스너
  useEffect(() => {
    const handleRatingUpdate = async (event) => {
      const { bookId: eventBookId } = event.detail;
      
      // if (!book || !book.id || book.id !== eventBookId || !bookId || !API_URL) {
      //   console.log('📊 평점 업데이트 이벤트 무시:', {
      //     bookExists: !!book,
      //     bookId: book?.id,
      //     eventBookId,
      //     currentBookId: bookId
      //   });
      //   return;
      // }
      
      // console.log(`📊 책 ${eventBookId}의 평점이 업데이트됨 - 데이터 새로고침 시작`);
      
      try {
        const response = await fetch(`${API_URL}/api/books/${bookId}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          // console.log('📚 업데이트된 책 데이터:', {
          //   title: data.data.title,
          //   id: data.data.id,
          //   avg: data.data.avg
          // });
          setBook(data.data);
          // console.log('✅ 평점 업데이트 후 책 데이터 새로고침 완료');
        }
      } catch (error) {
        console.error('❌ 평점 업데이트 후 데이터 새로고침 실패:', error);
      }
    };

    window.addEventListener('bookRatingUpdated', handleRatingUpdate);
    
    return () => {
      window.removeEventListener('bookRatingUpdated', handleRatingUpdate);
    };
  }, [book?.id, bookId, API_URL]);

  // 🔧 책 데이터 가져오기 (props로 받지 못한 경우)
  useEffect(() => {
    const fetchBook = async () => {
      // props로 받은 데이터가 있거나 bookId가 없으면 실행하지 않음
      if (propBookData || !bookId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setBook(null); // ✅ 이전 book 데이터 완전히 초기화
        
        // console.log('🔄 새로운 책 데이터 요청:', bookId);
        
        const response = await fetch(`${API_URL}/api/books/${bookId}`);
        const data = await response.json();

        if (response.ok && data.success) {
          // console.log('📖 새로운 책 데이터 수신:', {
          //   title: data.data.title,
          //   id: data.data.id,
          //   avg: data.data.avg,
          //   avgType: typeof data.data.avg
          // });
          setBook(data.data);
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
  }, [bookId, propBookData, API_URL]); // 🔧 bookId가 바뀔 때마다 새로 로드

  // 🔧 props로 받은 bookData가 바뀔 때 처리
  useEffect(() => {
    if (propBookData && propBookData.id !== book?.id) {
      // console.log('📚 Props에서 새로운 책 데이터 수신:', {
      //   title: propBookData.title,
      //   id: propBookData.id,
      //   avg: propBookData.avg
      // });
      setBook(propBookData);
      setLoading(false);
      setError(null);
    }
  }, [propBookData, book?.id]);

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

  // 에러 상태
  if (error) {
    return (
      <Alert variant="danger" className="text-center">
        <Alert.Heading>오류 발생</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  // 책 데이터가 없는 경우
  if (!book) {
    return (
      <Alert variant="warning" className="text-center">
        <Alert.Heading>책을 찾을 수 없습니다</Alert.Heading>
        <p>요청하신 책 정보를 찾을 수 없습니다. (ID: {bookId})</p>
      </Alert>
    );
  }

  return (
    <Card>
      <BookTitle 
        title={book.title}
        averageRating={book.avg || book.average_rating || 0}
        book={book}
        bookId={parseInt(bookId)}
        currentUser={currentUser}  
      />

      <Card.Body>
        <Row>
          {/* 책 표지 이미지 */}
          <Col md={4} className="bookimg">
            <BookCover book={book} />
          </Col>

          {/* 중앙 컨텐츠 */}
          <Col md={8}>
            <Row>
              {/* 책 줄거리 */}
              <Col md={12} className="bookcontent">
                <BookSummary book={book} />
              </Col>

              {/* 도서 정보 */}
              <Col md={12}>
                <BookInfo book={book} />
              </Col>
            </Row>
          </Col>
        </Row>
        
        {/* 채팅 섹션 */}
        <Row className="mt-4">
          <Col md={12}>
            <ChatSection 
              bookId={parseInt(bookId)} 
              currentUser={currentUser}
            />
          </Col>
        </Row>

        {/* 디버그 정보 (개발 환경에서만) */}
        {/* {process.env.NODE_ENV === 'development' && (
          <Row className="mt-3">
            <Col md={12}>
              <Card className="bg-light">
                <Card.Header>
                  <small className="text-muted">🔧 개발자 정보</small>
                </Card.Header>
                <Card.Body>
                  <small>
                    <strong>Book ID:</strong> {bookId}<br/>
                    <strong>Book Title:</strong> {book.title}<br/>
                    <strong>Average Rating:</strong> {book.avg || 'N/A'} (타입: {typeof book.avg})<br/>
                    <strong>Authors:</strong> {book.authors || 'N/A'}<br/>
                    <strong>ISBN:</strong> {book.isbn || 'N/A'}<br/>
                    <strong>Current User:</strong> {currentUser ? `${currentUser.nickname} (ID: ${currentUser.id}, user_id: ${currentUser.user_id})` : 'Not logged in'}<br/>
                    <strong>API URL:</strong> {API_URL || 'Default (proxy)'}<br/>
                    <strong>Props BookId:</strong> {propBookId || 'N/A'}<br/>
                    <strong>URL BookId:</strong> {urlId || 'N/A'}
                  </small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )} */}
      </Card.Body>
    </Card>
  );
}