import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const BookCover = ({ book }) => {
  return (
    <Link to={`/book/${book.id}`} className="text-decoration-none">
      <Card className="h-100 book-cover-card border-0 shadow-sm">
        <div className="book-cover-img-container">
          <Card.Img 
            variant="top" 
            src={book.cover_image || 'https://via.placeholder.com/200x300?text=No+Cover'} 
            alt={book.title}
            className="book-cover-img"
          />
        </div>
        <Card.Body className="p-2">
          <Card.Title className="fs-6 text-truncate">{book.title}</Card.Title>
          <Card.Text className="text-muted small text-truncate">{book.author}</Card.Text>
        </Card.Body>
      </Card>
    </Link>
  );
};

export default BookCover;