// src/pages/MainSearchPage.jsx
import React, { useState } from 'react';
import '../css/MainPage.scss';
import { Search } from 'lucide-react';


const MainSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    console.log('검색어:', searchQuery);
    // 검색 로직 구현
  };

  return (
    <div
      className="main-container"
      // style={{ '--bg-image': "url('/img/logo-background.png')" }}
    >
      {/* 메인 컨텐츠 */}
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
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-2xl font-bold text-blue-600">
                BookleTalk
              </div>
            </div>
          </div>

          {/* 검색창 */}
          <div className="w-full">
          <div className="search-wrapper">
              <input
                type="text"
                placeholder="검색어를 입력해주세요."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="search-icon" onClick={handleSearch}>
                <Search size={18} />
              </button>
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
              <p>베스트셀러</p>
            </div>
          </section>
        )}
      </div>

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default MainSearchPage;
