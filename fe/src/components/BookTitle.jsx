// src/components/BookTitle.jsx
import React from 'react';
import { Card } from 'react-bootstrap';
import { Star } from 'lucide-react';

export const BookTitle = ({ title, averageRating }) => {
  title = title || "해리포터 불사조의 기사단 파트 2";
  averageRating = averageRating || 3.8;
  
  const fullStars = Math.floor(averageRating);
  
  return (
    <Card.Header className="bg-light">
      <div className="d-flex align-items-center flex-wrap">
        <h5 className="mb-0 me-2">제목 : {title}</h5>
        <div className="d-flex text-warning ms-2">
          {[...Array(fullStars)].map((_, i) => (
            <Star key={i} size={16} fill="currentColor" />
          ))}
        </div>
        <span className="text-muted ms-1">oo {averageRating}</span>
        <small className="text-muted ms-2">(Kakao API로 조회 예정)</small>
      </div>
    </Card.Header>
  );
};
export default BookTitle;
