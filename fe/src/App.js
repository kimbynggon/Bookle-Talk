import React from 'react';
import './App.scss';
import SearchForm from './components/SearchForm';
import BookReviewPage from './pages/BookReviewPage';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';

function App() {
  return (
    <div className="app">
        <Header />
      <main className="app-main">
      <Routes>
        <Route path="/" element={<MainPage />} />
    </Routes>
      </main>
        <Footer />
    </div>
  );
}

export default App;