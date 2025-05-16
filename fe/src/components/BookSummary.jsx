// src/components/BookSummary.jsx
import React from 'react';
import { Card } from 'react-bootstrap';

export const BookSummary = ({ summary }) => {
  const summaryText = summary || "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s...";
  
  return (
    <Card className="shadow-sm mt-4">
      <Card.Header className="bg-white">
        <h6 className="mb-0 fw-bold">줄거리 요약</h6>
      </Card.Header>
      <Card.Body>
        {!summary && <small className="text-muted">(Kakao API로 조회 예정)</small>}
        <p className={!summary ? "mt-2 mb-0" : "mb-0"}>
          {summaryText}
        </p>
      </Card.Body>
    </Card>
  );
};
export default BookSummary;