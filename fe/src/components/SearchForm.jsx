import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './SearchForm.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons'

const SearchForm = ({ query: initialQuery = '', onBookSelect = () => {}, selectedBookId = null }) => {
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [sortType, setSortType] = useState('latest');
  const [last, setLast] = useState(1);
  const [documents, setDocuments] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const firstLoad = useRef(true);

  // API URL 안전하게 가져오기
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
  
  // console.log('🔧 SearchForm API_URL:', API_URL); // 디버깅용

  const sortMap = {
    latest: 'latest',
    rating: 'rating',
    naming: 'title_asc',
    descending: 'price_desc',
    ascending: 'price_asc',
  };
  
  const getSortLabel = (type) => {
    switch (type) {
      case 'latest':
        return '최신순';
      case 'rating':
        return '별점순';
      case 'naming':
        return '이름순';
      case 'descending':
        return '높은가격순';
      case 'ascending':
        return '낮은가격순';
      default:
        return '정렬';
    }
  };
  
  const callAPI = useCallback(async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // URL 안전하게 구성
      const searchUrl = `${API_URL}/api/search`;
      // console.log('🔍 API 호출 URL:', searchUrl);
      
      const response = await axios.get(searchUrl, {
        params: {
          query: query,
          page: page,
          sort: sortMap[sortType] || 'latest',
        },
        timeout: 10000 // 10초 타임아웃
      });
      
      // console.log('📥 API 응답:', response.data);
      
      setDocuments(response.data.documents);
      const total = response.data.meta.pageable_count;
      setLast(Math.ceil(total / 10));
      
    } catch (error) {
      console.error('❌ 검색 실패:', error);
      
      let errorMessage = '검색 중 오류가 발생했습니다.';
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage = '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.';
      } else if (error.response) {
        errorMessage = `서버 오류: ${error.response.status} - ${error.response.data?.message || error.message}`;
      } else if (error.request) {
        errorMessage = '서버 응답이 없습니다. 네트워크 연결을 확인해주세요.';
      }
      
      setError(errorMessage);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [query, page, sortType, API_URL]);

  useEffect(() => {
    if (searchTriggered || firstLoad.current) {
      callAPI();
      firstLoad.current = false;
    }
  }, [page, callAPI, searchTriggered]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
  
    setPage(1);
    setSearchTriggered(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookSelect = (book) => {
    // console.log('📚 책 선택됨:', book);
    onBookSelect(book);
  };
  
  const handleSortChange = (type) => {
    setSortType(type);
    setShowSortOptions(false);
    setPage(1);
    setSearchTriggered(true);
  };

  const toggleSortOptions = () => {
    setShowSortOptions(!showSortOptions);
  };
  
  const setViewModeType = (mode) => {
    setViewMode(mode);
  };
  
  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSortOptions && !event.target.closest('.sort-dropdown')) {
        setShowSortOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortOptions]);

  // 이미지 에러 처리
  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDEyMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjYwIiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7snbTrr7jsp4Ag7JeG7J2MPC90ZXh0Pgo8L3N2Zz4K';
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="book-list">
        <form onSubmit={handleSubmit}>
          <input 
            className='input' 
            type="text" 
            placeholder='책 제목, 저자, 출판사, ...' 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
          />
          <button disabled={query.trim() === ""}>검색</button>
        </form>
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">검색 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="book-list">
        <form onSubmit={handleSubmit}>
          <input 
            className='input' 
            type="text" 
            placeholder='책 제목, 저자, 출판사, ...' 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
          />
          <button disabled={query.trim() === ""}>검색</button>
        </form>
        <div className="alert alert-danger text-center">
          <h5>🚨 검색 오류</h5>
          <p>{error}</p>
          <button 
            className="btn btn-primary mt-2" 
            onClick={() => {
              setError(null);
              callAPI();
            }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 결과 없음
  if (documents === null || documents.length === 0) {
    return (
      <div className="book-list">
        <form onSubmit={handleSubmit}>
          <input 
            className='input' 
            type="text" 
            placeholder='책 제목, 저자, 출판사, ...' 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
          />
          <button disabled={query.trim() === ""}>검색</button>
        </form>
        <div className="text-center py-5">
          <p>검색 결과가 없습니다.</p>
          <p>다른 검색어로 시도해보세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='book-list'>
        <form onSubmit={handleSubmit}>
            <input 
              className='input' 
              type="text" 
              placeholder='검색어를 입력하세요' 
              value={query} 
              onChange={(e)=>setQuery(e.target.value)}/>
            <button className="search-icon" disabled={query.trim() === ""}>
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
        </form>

        {/* 정렬 옵션과 보기 모드 버튼 */}
        <div className='view-controls'>
            <div className='sort-dropdown'>
            <button className='sort-button' onClick={toggleSortOptions}>
              <span>{getSortLabel(sortType)}</span> 
              <span>▼</span>
            </button>
                {showSortOptions && (
                    <div className='sort-options'>
                        <div 
                            className={`sort-option ${sortType === 'rating' ? 'active' : ''}`} 
                            onClick={() => handleSortChange('rating')}>
                            별점순
                        </div>
                        <div 
                            className={`sort-option ${sortType === 'title_asc' ? 'active' : ''}`} 
                            onClick={() => handleSortChange('title_asc')}>
                            이름순
                        </div>
                        <div 
                            className={`sort-option ${sortType === 'price_desc' ? 'active' : ''}`} 
                            onClick={() => handleSortChange('price_desc')}>
                            높은가격순
                        </div>
                        <div 
                            className={`sort-option ${sortType === 'price_asc' ? 'active' : ''}`} 
                            onClick={() => handleSortChange('price_asc')}>
                            낮은가격순
                        </div>
                    </div>
                )}
            </div>
            <div className='view-toggle'>
                <button 
                    className={`view-button ${viewMode === 'grid' ? 'active' : ''}`} 
                    onClick={() => setViewModeType('grid')}>
                    그리드형
                </button>
                <button 
                    className={`view-button ${viewMode === 'list' ? 'active' : ''}`} 
                    onClick={() => setViewModeType('list')}>
                    목록형
                </button>
            </div>
        </div>
        {/* 검색 결과 개수 표시 */}
        <div className="search-info">
          <p>총 <strong>{documents.length}</strong>권의 책을 찾았습니다.</p>
        </div>
        
        <div className={`documents ${viewMode}`}>
        {documents.map((book, index) => (
          <div 
            key={book.isbn || index}
            className={`box ${selectedBookId && book.id === selectedBookId ? 'selected' : ''}`}
            onClick={() => handleBookSelect(book)}
            style={{ cursor: 'pointer' }}  
          >
                    <div className='book-info-1'>
                    <img 
                      id='book-img' 
                      src={book.thumbnail || 'http://via.placeholder.com/120X150?text=No+Image'} 
                      alt={book.title || "책 표지"}
                      onError={handleImageError}
                      />
                    
                    </div>
                    <div className='ellipsis'>
                        {/* <div id='rating'>{'⭐️'.repeat(Math.trunc(book.avg))}{''.repeat(5-Math.trunc(book.avg))} {book.avg}점 ({book.user}명)</div> */}
                        <div id='rating'>⭐️⭐️⭐️ 3점</div>
                      </div>
                    <div className='book-info-2'>
                      <div className='ellipsis'>
                        <div id='category'>제목</div> 
                        <div id='detail' title={book.title}>{book.title}</div>
                      </div>
                      <div className='ellipsis'>
                        <div id='category'>저자/역자</div> 
                        <div id='detail' title={book.authors}>
                  {Array.isArray(book.authors) ? book.authors.join(', ') : book.authors}
                </div>
                      </div>
                      <div className='ellipsis'>
                        <div id='category'>가격(정가)</div> 
                        <div id='detail'>{book.price ? `${book.price.toLocaleString()}원` : '정보 없음'}</div>
                      </div>
                    </div>
                </div>
            ))}
        </div>
        <div>
            <button onClick={()=> {
              setPage(page-1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}>이전</button>

        <span style={{margin:'10px'}}>{page}/{last}</span>

        <button 
          onClick={() => {
            setPage(page + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} 
          disabled={page === last}
        >
          다음
        </button>
      </div>
    </div>
  )
};

export default SearchForm;