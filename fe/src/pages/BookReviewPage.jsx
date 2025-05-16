// src/pages/BookReviewPage.jsx
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import BookTitle from '../components/BookTitle.jsx';
import BookCover from '../components/BookCover.jsx';
import ChatSection from '../components/ChatSection.jsx';
import BookSummary from '../components/BookSummary.jsx';
import BookInfo from '../components/BookInfo.jsx';

export default function BookReviewPage() {
  // 나중에 API에서 가져올 데이터 더미데이터로 만든거라 달라질수도 있음
  const bookData = {
    title: "해리포터 불사조의 기사단 파트 2",
    averageRating: 3.8,
    imageUrl: null,
    summary: null,
    author: "J. K. Rowling",
    translator: "김혜원",
    publisher: "Yes24",
    price: "50,000원"
  };

  return (
    <Card className="shadow-sm">
      {/* 책 제목 및 평점 */}
      <BookTitle 
        title={bookData.title} 
        averageRating={bookData.averageRating} 
      />

      <Card.Body>
        <Row>
          {/* 책 표지 이미지 */}
          <Col md={4} className="mb-3 mb-md-0">
            <BookCover imageUrl={bookData.imageUrl} />
          </Col>

          {/* 채팅 섹션 */}
          <Col md={8}>
            <ChatSection />
          </Col>
        </Row>

        {/* 책 줄거리 */}
        <BookSummary summary={bookData.summary} />

        {/* 도서 정보 */}
        <BookInfo 
          author={bookData.author}
          translator={bookData.translator}
          publisher={bookData.publisher}
          price={bookData.price}
        />
      </Card.Body>
    </Card>
  );
}