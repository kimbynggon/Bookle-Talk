// src/pages/MainSearchPage.jsx
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Header from '../components/common/Header.js';
import Footer from '../components/common/Footer.js';

const MainSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    console.log('검색어:', searchQuery);
    // 여기에 검색 로직 구현
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <Header />

      {/* 메인 컨텐츠 */}
      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center mb-12">
          {/* 로고 */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <svg className="w-40 h-40 text-blue-100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path 
                  fill="currentColor" 
                  d="M20 15 L80 15 L80 85 L20 85 Z" 
                />
                <path 
                  fill="#fff" 
                  d="M30 15 L30 85 Z" 
                />
                <path 
                  stroke="#4b85f0" 
                  strokeWidth="1" 
                  fill="none" 
                  d="M20 15 L80 15 L80 85 L20 85 Z" 
                />
                <path 
                  stroke="#4b85f0" 
                  strokeWidth="1" 
                  fill="none" 
                  d="M30 15 L30 85" 
                />
                <path 
                  stroke="#4b85f0" 
                  strokeWidth="1" 
                  fill="none" 
                  d="M40 35 C50 25, 60 25, 70 35" 
                />
                <path 
                  stroke="#4b85f0" 
                  strokeWidth="1" 
                  fill="none" 
                  d="M40 50 C50 40, 60 40, 70 50" 
                />
                <path 
                  stroke="#4b85f0" 
                  strokeWidth="1" 
                  fill="none" 
                  d="M40 65 C50 55, 60 55, 70 65" 
                />
              </svg>
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-2xl font-bold text-blue-600">
                BookleTalk
              </div>
            </div>
          </div>

          {/* 검색창 */}
          <div className="w-full">
            <div className="relative flex">
              <input
                type="text"
                placeholder="검색어를 입력해주세요."
                className="w-full py-3 px-4 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500"
              >
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* 검색 팁 */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <button className="py-2 px-3 bg-white rounded border border-gray-200 shadow-sm hover:shadow text-gray-600">
              베스트셀러
            </button>
            <button className="py-2 px-3 bg-white rounded border border-gray-200 shadow-sm hover:shadow text-gray-600">
              신간도서
            </button>
            <button className="py-2 px-3 bg-white rounded border border-gray-200 shadow-sm hover:shadow text-gray-600">
              추천도서
            </button>
            <button className="py-2 px-3 bg-white rounded border border-gray-200 shadow-sm hover:shadow text-gray-600">
              인기검색어
            </button>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <Footer />
    </div>
  );
};

export default MainSearchPage;