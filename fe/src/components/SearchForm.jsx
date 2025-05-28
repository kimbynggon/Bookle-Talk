import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './SearchForm.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons'

const testApi = process.env.REACT_APP_API_URL

const SearchForm = ({ query: initialQuery = '', onBookSelect = () => {}}) => {
  const [query,setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState('');
  const [page,setPage] = useState(1);
  const [sortType, setSortType] = useState('accuracy'); // 정렬 타입
  const [showSortOptions, setShowSortOptions] = useState(false); // 정렬 옵션 드롭다운 표시 여부
  const [last,setLast] = useState(1);
  const [documents,setDocuments] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 보기 모드 (그리드형, 목록형)
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchTriggered, setSearchTriggered] = useState(false);
  
  const firstLoad = useRef(true);

  const sortMap = {
    rating: 'rating',          // 백엔드에서는 처리 안됨, 향후 DB 기반 별점 추가 필요
    title_asc: 'title_asc',
    price_desc: 'price_desc',
    price_asc: 'price_asc',
  };
  
  const getSortLabel = (type) => {
    switch (type) {
      case 'rating':
        return '별점순';
      case 'title_asc':
        return '이름순';
      case 'price_desc':
        return '높은가격순';
      // case 'price_asc':
      //   return '낮은가격순';
      default:
        return '정렬';
    }
  };
  
  const callAPI = useCallback(async(e) => {
    try {
      const response = await axios.get(`${testApi}/api/search`, {
        params: {
          query: query,
          page: page,
          sort: sortMap[sortType] || 'accuracy',
        }
      });
      setDocuments(response.data.documents); // 검색 결과 books 리스트만 전달
      const total = response.data.meta.pageable_count; // 전체 문서 갯수 저장
      setLast(Math.ceil(total/10))
    
    } catch (error) {
      console.error('검색 실패: ', error);
    }
  }, [query, page, sortType]);

  useEffect(()=>{ // 질문하기..
    if (!query.trim()) return;

    // if (searchTriggered || firstLoad.current || page >= 1) {
      callAPI();
      // firstLoad.current = false;
    // }
  },[page, callAPI, searchTriggered, sortType])
  

  // useEffect(()=>{
  //   if(!isInitialized) {
  //     const firstBook = documents[0];
  //     setSelectedBookId(firstBook.id);
  //     onBookSelect(firstBook);
  //     setIsInitialized(true);
  //   }
  // }, [onBookSelect, isInitialized]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
  
    setPage(1); // 첫 페이지로 초기화
    setSearchTriggered(true); // 검색 트리거 ON
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // const handleQuery = (e) => {
  //   if(searchTriggered) {
  //     setQuery(e);
  //     searchTriggered = false;
  //   }
  // }

  const handleBookSelect = (book) => {
    setSelectedBookId(book.id);
    onBookSelect(book);
  };
  
  // 정렬 타입
  const handleSortChange = (type) => {
    setSortType(type);
    // callAPI();
    setShowSortOptions(false); // 선택 후 드롭다운 닫기
    setPage(1);
  };
  

  // 드롭다운 토글
  const toggleSortOptions = () => {
    setShowSortOptions(!showSortOptions);
  };
  
  // 보기 모드 변경
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
  

  if (documents === null) {
  return <p>검색 결과가 없습니다.</p>;
}
const handleImageError = (e) => {
  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDEyMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjYwIiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7snbTrr7jsp4Ag7JeG7J2MPC90ZXh0Pgo8L3N2Zz4K';
};

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
        
        <div className={`documents ${viewMode}`}>
            {documents.map(book=>(
                <div 
                  key={book.isbn ||book.id}
                  className='box'
                  onClick={() => handleBookSelect(book)}
                  style={{ cursor: 'pointer' }}  
                  >
                    <div className='book-info-1'>
                      <img d='book-img' 
                      src={book.thumbnail || 'http://via.placeholder.com/120X150?text=No+Image'} 
                      alt={book.title || "책 표지"}
                      onError={handleImageError}/>
                    </div>
                    <div className='book-info-2'>
                      <div className='ellipsis'>
                        {/* <div id='rating'>{'⭐️'.repeat(Math.trunc(book.avg))}{''.repeat(5-Math.trunc(book.avg))} {book.avg}점 ({book.user}명)</div> */}
                        <div id='rating'>⭐️⭐️⭐️ 3점</div>
                      </div>
                      <div className='ellipsis title' data-tooltip={book.title}>
                        <div id='category'>제목</div> 
                        <div id='detail'>{book.title}</div>
                      </div>
                      <div className='ellipsis'>
                        <div id='category'>저자/역자</div> 
                        <div id='detail'title={book.authors}>
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
        <div id='paging'>
            <button onClick={()=> {
              setPage(page-1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}>이전</button>

            <span style={{margin:'10px'}}>{page}/{last}</span>

            <button onClick={()=> {
              setPage(page+1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}>다음</button>
        </div>
        
    </div>
  )
};

export default SearchForm;