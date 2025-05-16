import React from 'react';
import './App.css';
import BookReviewPage from './pages/BookReviewPage';

function App() {
  return (
    <div className="App">
      {/* 기본적으로 BookReviewPage를 렌더링하거나, 
          개별 컴포넌트들을 직접 구성할 수 있습니다 */}
      <BookReviewPage />
    </div>
  );
}

export default App;