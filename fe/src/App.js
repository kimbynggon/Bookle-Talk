import React from 'react';
import './App.scss';
import SearchForm from './components/SearchForm';
import BookReviewPage from './pages/BookReviewPage';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Bookle-Talk</h1>
      </header>

      <main className="app-main">
        <SearchForm title='도서 검색'/>
        <BookReviewPage />
      </main>

      <footer className="app-footer">
        <p>북톡 - 도서 검색 서비스</p>
      </footer>
    </div>
  );
}

export default App;