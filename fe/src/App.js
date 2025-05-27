import React from 'react';
import './App.scss';
import SearchForm from './components/SearchForm';
import BookReviewPage from './pages/BookReviewPage';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import 'bootstrap/dist/css/bootstrap.min.css'
import MainPage from './pages/MainPage';

function App() {
  return (
    <div className="app">
        <Header />
      <main className="app-main">
       <MainPage />
      </main>
        <Footer />  
    </div>
  );
}

export default App;