import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import BookReviewPage from './BookReviewPage';
import SearchForm from '../components/SearchForm';
import AuthModal from "../components/modal/AuthModal.jsx";
import '../css/MainPage.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons'
import { Card } from 'react-bootstrap';
import logo from '../img/logo.png'

const MainSearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearched, setIsSearched] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const inputRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || '';

  // 현재 사용자 정보 가져오기 (JWT 토큰 기반)
  useEffect(() => {
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
        // 토큰이 유효하지 않으면 로그아웃
        localStorage.removeItem('token');
        localStorage.removeItem('nickname');
      }
    }
  }, []);

  // URL 파라미터에서 검색어와 책 ID 가져오기
  useEffect(() => {
    const query = searchParams.get('q');
    const bookId = searchParams.get('bookId');
    
    if (query) {
      setSearchQuery(query);
      setIsSearched(true);
    }
    
    if (bookId) {
      setSelectedBookId(parseInt(bookId));
    }
  }, [location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearched(true);
      setIsError(false);
      setIsSuccess(true);
      setSelectedBook(null);
      setSelectedBookId(null);
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      setIsError(true);
      setIsSuccess(false);
      inputRef.current?.focus();
    }
  };

  const handleBookSelect = useCallback(async (book) => {
    try {
      // ISBN으로 실제 DB에서 책 정보 조회
      const isbn = book.isbn?.split(' ')[0]; // 첫 번째 ISBN만 사용
      const response = await fetch(`${API_URL}/api/books/isbn/${isbn}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        // DB에 책이 있는 경우
        setSelectedBook(data.data);
        setSelectedBookId(data.data.id);
        const query = searchParams.get('q');
        if (query) {
          navigate(`/?q=${encodeURIComponent(query)}&bookId=${data.data.id}`);
        }
      } else {
        // DB에 책이 없으면 새로 생성
        console.warn('DB에서 책을 찾을 수 없음, 새 책 생성');
        const createResponse = await fetch(`${API_URL}/api/books`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: book.title,
            authors: Array.isArray(book.authors) ? book.authors.join(', ') : book.authors,
            thumbnail: book.thumbnail,
            datetime: book.datetime,
            isbn: isbn,
            price: book.price,
            translators: Array.isArray(book.translators) ? book.translators.join(', ') : book.translators || '',
            contents: book.contents,
            publisher: book.publisher,
            url: book.url
          })
        });
        
        const createData = await createResponse.json();
        if (createResponse.ok && createData.success) {
          setSelectedBook(createData.data);
          setSelectedBookId(createData.data.id);
          const query = searchParams.get('q');
          if (query) {
            navigate(`/?q=${encodeURIComponent(query)}&bookId=${createData.data.id}`);
          }
        } else {
          console.error('책 생성 실패:', createData.message);
          alert('책 정보를 저장하는데 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('책 선택 처리 오류:', error);
      alert('책 정보를 처리하는 중 오류가 발생했습니다.');
    }
  }, [API_URL, searchParams, navigate]);

  // 플레이스홀더 컴포넌트
  const PlaceholderCard = () => (
    <Card className="h-100 d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
      <Card.Body className="text-center">
        <div className="" style={{ fontSize: '8rem', opacity: 0.3 }}>
          📚
        </div>
        <h5 className="text-muted mb-3">책을 선택해주세요</h5>
        <p className="text-muted">
          왼쪽 목록에서 책을 클릭하면<br />
          상세 정보가 여기에 표시됩니다.
        </p>
      </Card.Body>
    </Card>
  );

  return (
    <div className={`main-container ${isSearched ? 'searched' : 'initial'}`}>
      <main className="content px-4">
        <div className="max-w-2xl w-full text-center mb-12">
          <div className="logo-img">
            <img src={logo} alt="logo" />
          </div>  
          {/* 검색창 */}
          <div className="w-full">
          <div className={`search-wrapper ${isSearched ? 'searched' : 'initial'}`}>
              {!isSearched && (
                <div className="search-bar">
                  
                  <form onSubmit={handleSearch} className="bookSearchForm">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="검색어를 입력하세요"
                      className={`searchInput ${isError ? 'error' : ''} ${isSuccess ? 'success' : ''}`}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsError(false);
                        setIsSuccess(false);
                      }}
                    />
                    <button className="search-icon" type="submit" disabled={searchQuery.trim() === ''}>
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </button>
                  </form>
                </div>
              )}

              {isSearched ? (
                <section className="bookContainer" style={{ display: 'flex', gap: '50px', padding: '0px' }}>
                  <div className='book-list' style={{ flex: '1'}}>
                  <SearchForm 
                    query={searchQuery} 
                    onBookSelect={handleBookSelect} 
                  />
                  </div>
                  <div className='book-detail' style={{ flex: '2'}}>
                  {selectedBook && selectedBookId ? (
                    <BookReviewPage 
                      bookId={selectedBookId} 
                      bookData={selectedBook}
                      currentUser={currentUser}
                    />
                    ) : (
                      <PlaceholderCard />
                    )}
                  </div>
                </section>
              ) : (
                <section className="bookContainer" style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center'}}>
                  <div className="bookList">
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>


      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default MainSearchPage;
