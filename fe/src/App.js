import React from 'react';
import './App.scss';
import SearchForm from './components/SearchForm';
import BookReviewPage from './pages/BookReviewPage';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import MainPage from './pages/MainPage';

function App() {
  return (

    // <Router>
      // <div className="app-container d-flex flex-column min-vh-100">
      //   <Header />
      //   <Container className="flex-grow-1 searchmain">
      //     <Routes>
      //       <Route path="/" element={<MainPage />} />
      //       <Route path="/book/:id" element={<BookReviewPage />} />
      //     </Routes>
      //   </Container>
      //   <Footer />
      // </div>
    // </Router>
    <div className="app">
        <Header />
      <main className="app-main">
       <MainPage />
      </main>
        <Footer />  
    </div>
  )
}

export default App;