// fe/src/components/BookSummary.jsx
import React from 'react';
import { Card } from 'react-bootstrap';

const BookSummary = ({ book }) => {
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body>
        <h5 className="card-title fw-bold mb-3">책 소개</h5>
        <p className="card-text text-muted">
          {book.description || '이 책에 대한 소개가 없습니다.'}
        </p>
      </Card.Body>
    </Card>
  );
};

export default BookSummary;