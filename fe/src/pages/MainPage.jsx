import React, { useState } from 'react';
import { Search } from 'lucide-react';
import '../App.css';
import { bookService } from '../services/bookService';

const MainPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await bookService.searchBooks(searchQuery);
      setBooks(result.data);
    } catch (err) {
      setError('Failed to fetch books');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" style={{width: '100%'}}>


      {/* 메인 컨텐츠 */}
      <main className="flex-grow flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full text-center mb-12">
          {/* 로고 */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <svg className="w-40 h-40 text-blue-100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{
                width: '100px',
                height: '100px',
              }}>
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
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <h1 className="text-4xl font-bold text-blue-600">Bookle</h1>
              </div>
            </div>
          </div>

          {/* 검색 폼 */}
          <div className="mt-8">
            <div className="relative">
              <input
                type="text"
                placeholder="도서를 검색해보세요"
                className="w-full px-4 py-2 text-xl border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default MainPage;