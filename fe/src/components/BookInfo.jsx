// fe/src/components/BookInfo.jsx
import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Star } from 'lucide-react';

const BookInfo = ({ book }) => {
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body>
        <div className="d-flex mb-3">
          <div className="text-warning me-2">
            {[...Array(Math.round(book.average_rating || 0))].map((_, i) => (
              <Star key={i} size={16} fill="currentColor" />
            ))}
          </div>
          <span className="text-muted small">
            ({book.rating_count || 0}명 참여)
          </span>
        </div>
        
        <h6 className="fw-bold">출판 정보</h6>
        <ul className="list-unstyled text-muted small">
          <li>출판사: {book.publisher}</li>
          <li>출판일: {new Date(book.published_date).toLocaleDateString()}</li>
          <li>페이지: {book.pages}페이지</li>
          <li>ISBN: {book.isbn}</li>
        </ul>
        
        <h6 className="fw-bold mt-3">장르</h6>
        <div>
          {book.genres && book.genres.map((genre, index) => (
            <Badge bg="secondary" className="me-1 mb-1" key={index}>
              {genre}
            </Badge>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default BookInfo;