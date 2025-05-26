import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../App.css'
const BookCover = ({ book }) => {
  if (!book) {
    return (
      <Card className="h-100 book-cover-card border-0">
        <Card.Body className="d-flex align-items-center justify-content-center">
          <span className="text-muted">책 정보를 불러오는 중...</span>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card to={`/book/${book.id}`} className="text-decoration-none">
      <Card className="h-100 book-cover-card border-0">
        <div className="book-cover-img-container">
          <Card.Img 
            variant="top" 
            src={book.image || book.cover_image || 'https://via.placeholder.com/200x300?text=No+Cover'} 
            // alt={book.title || '제목 없음'}
            className="book-cover-img"
          />
        </div>
        {/* <Card.Body className="p-2">
          <Card.Title className="fs-6 text-truncate">{book.title || '제목 없음'}</Card.Title>
          <Card.Text className="text-muted small text-truncate">{book.author || '저자 미상'}</Card.Text>
        </Card.Body> */}
      </Card>
    </Card>
  );
};

export default BookCover;