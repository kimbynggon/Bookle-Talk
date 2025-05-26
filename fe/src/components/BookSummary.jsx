import React from 'react';
import { Card } from 'react-bootstrap';

const BookSummary = ({ book }) => {
  if (!book) {
    return (
      <Card className="border-0 h-100">
        <Card.Body>
          <span className="text-muted">책 정보를 불러오는 중...</span>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="border-0 h-100">
      <Card.Body>
        <h5 className="card-title fw-bold mb-3">책 소개</h5>
        <p className="card-text text-muted">
          {book.summary || book.description || '이 책에 대한 소개가 없습니다.'}
        </p>
      </Card.Body>
    </Card>
  );
};

export default BookSummary;