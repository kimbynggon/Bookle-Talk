// src/components/BookCover.jsx
import React from 'react';
import { Card } from 'react-bootstrap';

export const BookCover = ({ imageUrl }) => {
  return (
    <Card className="shadow-sm bg-light h-100">
      {imageUrl ? (
        <Card.Img 
          src={imageUrl} 
          alt="책 표지" 
          className="img-fluid"
          style={{ objectFit: 'cover', height: '100%' }}
        />
      ) : (
        <Card.Body className="text-center py-5">
          <h3 className="text-secondary">이미지</h3>
          <small className="text-muted">(Kakao API로 조회 예정)</small>
        </Card.Body>
      )}
    </Card>
  );
};
export default BookCover;