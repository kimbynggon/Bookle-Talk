import '../css/MainPage.scss'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import BookReviewPage from './BookReviewPage';
import SearchForm from '../components/SearchForm';
import { bookService } from '../services/bookService';
import logoImg from '../img/logo.png'
import AuthModal from "../components/modal/AuthModal.jsx";

export default function MainPage() {
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


  useEffect(() => {
    const query = searchParams.get('q');
    const bookId = searchParams.get('bookId');
    if (query) {
      setSearchQuery(query);
      setIsSearched(true);
      setIsSuccess(true);
    }
  }, [searchParams]);

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
    <div className="main-container" style={{ '--bg-image': `url(${logoImg})` }}>
      <div className="content">
        <div className="logo-area">
          <div className="icon"></div>
        </div>

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

        {isSearched ? (
          <section className="bookContainer" style={{ display: 'flex', gap: '20px', padding: '20px' }}>
            <div style={{ flex: '1' }}>
              <SearchForm query={searchQuery} onBookSelect={handleBookSelect} />
            </div>
            <div style={{ flex: '2' }}>
              <BookReviewPage selectedBook={selectedBook} />
            </div>
          </section>
        ) : (
          <section className="bookContainer">
            <div className="bookList">
            </div>
          </section>
        )}
      </div>

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
