import React from 'react';
import './App.scss';
import SearchForm from './components/SearchForm';
import BookReviewPage from './pages/BookReviewPage';
import Header from './components/common/Header';
import Footer from './components/common/Footer';

function App() {
  return (
    <div className="app">
        <Header />
      <main className="app-main">
        <SearchForm title='Bookle-Talk'/>
        <BookReviewPage />
      </main>
        <Footer />
    </div>
  );
}

export default App;