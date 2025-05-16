import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './SearchForm.scss';

const SearchForm = ({title}) => {
  const[query,setQuery] = useState('해리포터');
  const[page,setPage] = useState(1);
  const[last,setLast] = useState(1);
  const [documents,setDocuments] = useState(null);
  const[sortType, setSortType] = useState('latest'); // 정렬 타입 (최신순, 별점순)
  const[viewMode, setViewMode] = useState('grid'); // 보기 모드 (그리드형, 목록형)
  const[showSortOptions, setShowSortOptions] = useState(false); // 정렬 옵션 드롭다운 표시 여부

  const callAPI = useCallback(async() => {
    try {
      const response = await axios.get('/api/search', {
        params: {
          query: query,
          page: page
        }
      });
      setDocuments(response.data.documents); // 검색 결과 books 리스트만 전달
      const total = response.data.meta.pageable_count; // 전체 문서 갯수 저장
      setLast(Math.ceil(total/10))
    
    } catch (error) {
      console.error('검색 실패: ', error);
    }
  }, [query, page]);

  useEffect(()=>{
    callAPI(); // 렌더링 할 때마다 callAPI 호출
  },[page, callAPI])

  const handleSubmit = (e) => {
    e.preventDefault(); // 이벤트가 바로 실행되는 것 막음
    // if (!query.trim()) return;
    callAPI();
    setPage(1);
  }
  
  // 정렬 기능
  const sortDocuments = () => {
    if (!documents) return [];
    
    const sortedDocs = [...documents];
    
    if (sortType === 'latest') {
      // 최신순 정렬 (출판일 기준)
      return sortedDocs.sort((a, b) => {
        return new Date(b.datetime || 0) - new Date(a.datetime || 0);
      });
    } else if (sortType === 'rating') {
      // 별점순 정렬 (실제 별점 데이터가 없으므로 임의로 정렬)
      // 실제 구현 시 별점 데이터 사용
      return sortedDocs;
    }
    
    return sortedDocs;
  };
  
  // 정렬 타입
  const handleSortChange = (type) => {
    setSortType(type);
    setShowSortOptions(false); // 선택 후 드롭다운 닫기
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
  

  if(documents === null) {
    return <h3>로딩중..</h3>
  }

  const sortedDocuments = sortDocuments();

  return (
    <div className='book-list'>
        <h1>{title}</h1>
        <form onSubmit={handleSubmit}>
            <input className='input' type="text" placeholder='책 제목, 저자, 출판사, ...' value={query} onChange={(e)=>setQuery(e.target.value)}/>
            <button>검색</button>
        </form>

        {/* 정렬 옵션과 보기 모드 버튼 */}
        <div className='view-controls'>
            <div className='sort-dropdown'>
                <button className='sort-button' onClick={toggleSortOptions}>
                    {sortType === 'latest' ? '최신순' : '별점순'} ▼
                </button>
                {showSortOptions && (
                    <div className='sort-options'>
                        <div 
                            className={`sort-option ${sortType === 'latest' ? 'active' : ''}`} 
                            onClick={() => handleSortChange('latest')}>
                            최신순
                        </div>
                        <div 
                            className={`sort-option ${sortType === 'rating' ? 'active' : ''}`} 
                            onClick={() => handleSortChange('rating')}>
                            별점순
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
            {documents.map(d=>(
                <div className='box'>
                    <div className='book-info-1'>
                      <img id='book-img' src={d.thumbnail ? d.thumbnail:'http://via.placeholder.com/120X150'} alt="이미지" />
                      <p>별점 연동⭐⭐</p>
                    </div>
                    <div className='book-info-2'>
                      <div className='ellipsis'>
                        <div id='category'>제목</div> 
                        <div id='detail'>{d.title}</div>
                      </div>
                      <div className='ellipsis'>
                        <div id='category'>저자/역자</div> 
                        <div id='detail'>{d.authors}</div>
                      </div>
                      <div className='ellipsis'>
                        <div id='category'>가격(정가)</div> 
                        <div id='detail'>{d.price}원</div>
                      </div>
                    </div>
                </div>
            ))}
        </div>
        <div>
            <button onClick={()=> {
              setPage(page-1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} disabled={page===1}>이전</button>
            <span style={{margin:'10px'}}>{page}/{last}</span>
            <button onClick={()=> {
              setPage(page+1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} disabled={page===last}>다음</button>
        </div>
        
    </div>
  )
};

export default SearchForm;