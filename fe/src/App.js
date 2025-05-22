import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import MainPage from './pages/MainPage';
import BookReviewPage from './pages/BookReviewPage';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';

function App() {
  return (
    <Router>
      <div className="app-container d-flex flex-column min-vh-100">
        <Header />
<<<<<<< HEAD
        <Container className="flex-grow-1 searchmain">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/book/:id" element={<BookReviewPage />} />
          </Routes>
        </Container>
        <Footer />
      </div>
    </Router>
=======
      <main className="app-main">
       <MainPage />
      </main>
        <Footer />  
    </div>
>>>>>>> 3e0ba3384bfe42ea7e955f3210f6abe05df3cc98
  );
}

export default App;