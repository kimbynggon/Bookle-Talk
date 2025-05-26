import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import BookReviewPage from './BookReviewPage';
import SearchForm from '../components/SearchForm';
import { bookService } from '../services/bookService';
import logoImg from '../img/logo.png'
import AuthModal from "../components/modal/AuthModal.jsx";


const MainSearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearched, setIsSearched] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const inputRef = useRef(null);
  const [showModal, setShowModal] = useState(false);


  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearched(true);
      setIsError(false);
      setIsSuccess(true);
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      setIsError(true);
      setIsSuccess(false);
      inputRef.current?.focus();
    }
  };

  const handleBookSelect = useCallback((book) => {
    console.log(book);
    setSelectedBook(book);
    const query = searchParams.get('q');
    if (query) {
      navigate(`/?q=${encodeURIComponent(query)}&bookId=${book.id}`);
    }
  }, [searchParams, navigate]);

  return (
    <div className="main-container">
      <main className="content px-4">
        <div className="max-w-2xl w-full text-center mb-12">
          {/* 로고 */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              {/* <svg className="w-40 h-40 text-blue-100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M20 15 L80 15 L80 85 L20 85 Z" />
                <path fill="#fff" d="M30 15 L30 85 Z" />
                <path stroke="#4b85f0" strokeWidth="1" fill="none" d="M20 15 L80 15 L80 85 L20 85 Z" />
                <path stroke="#4b85f0" strokeWidth="1" fill="none" d="M30 15 L30 85" />
                <path stroke="#4b85f0" strokeWidth="1" fill="none" d="M40 35 C50 25, 60 25, 70 35" />
                <path stroke="#4b85f0" strokeWidth="1" fill="none" d="M40 50 C50 40, 60 40, 70 50" />
                <path stroke="#4b85f0" strokeWidth="1" fill="none" d="M40 65 C50 55, 60 55, 70 65" />
              </svg> */}
              <div className="logo-text">
                BookleTalk
              </div>
            </div>
          </div>

          {/* 검색창 */}
          <div className="w-full">
            <div className="search-wrapper">
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
              <button type="submit" disabled={searchQuery.trim() === ''}>검색</button>
            </form>
            </div>
          </div>
        </div>
      </main>

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
            <button type="submit" disabled={searchQuery.trim() === ''}>검색</button>
          </form>
        </div>
      )}

      {isSearched ? (
        <section className="bookContainer" style={{ display: 'flex', gap: '20px', padding: '20px' }}>
          <div style={{ flex: '1' }}>
            <SearchForm query={searchQuery} onBookSelect={handleBookSelect} />
          </div>
          <div style={{ flex: '2' }}>
            {/* <BookReviewPage/> bookid 문제 발생 */}
          </div>
        </section>
      ) : (
        <section className="bookContainer">
          <div className="bookList">
          </div>
        </section>
      )}

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default MainSearchPage;
