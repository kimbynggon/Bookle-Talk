// src/components/BookInfo.jsx
import React from 'react';
import { Card } from 'react-bootstrap';

export const BookInfo = ({ author, translator, publisher, price }) => {
  author = author || "J. K. Rowling";
  translator = translator || "김혜원";
  publisher = publisher || "Yes24";
  price = price || "50,000원";
  
  return (
    <Card className="shadow-sm mt-3">
      <Card.Header className="bg-white">
        <h6 className="mb-0 fw-bold">도서 정보</h6>
      </Card.Header>
      <Card.Body className="bg-light">
        <p className="mb-1">
          <span className="fw-medium">저자/역자 이름 :</span> {author}
          {!author && <small className="text-muted ms-1">(Kakao API로 조회 예정)</small>}
        </p>
        <p className="mb-1"><span className="fw-medium">번역가 :</span> {translator}</p>
        <p className="mb-1"><span className="fw-medium">출판사 :</span> {publisher}</p>
        <p className="mb-0"><span className="fw-medium">도서정가 :</span> {price}</p>
      </Card.Body>
    </Card>
  );
};
export default BookInfo;