// fe > src > components > BookInfo.jsx
import React from 'react';
import { Card, Badge, Tab, Tabs } from 'react-bootstrap';
import { Star } from 'lucide-react';

const BookInfo = ({ book }) => {
  if (!book) {
    return (
      <Card>
        <Card.Body>
          <div className="text-center text-muted">
            책 정보를 불러오는 중...
          </div>
        </Card.Body>
      </Card>
    );
  }

  const rawAvgRating = book.avg !== undefined && book.avg !== null ? book.avg : book.average_rating;
  const avgRating = typeof rawAvgRating === 'number' ? rawAvgRating : 0;
  const ratingCount = book.rating_count || 0;

  return (
    <Card>
      <Card.Header>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            {[...Array(Math.round(avgRating))].map((_, i) => (
              <Star key={i} size={16} fill="gold" color="gold" />
            ))}
          </div>
          {/* 평균 {avgRating.toFixed(1)}점 ({ratingCount}명 참여) */}
        </div>
      </Card.Header>

      <Card.Body>
        <Tabs
          defaultActiveKey="info"
          id="book-info-tabs"
          className="mb-3"
        >
          <Tab eventKey="info" title="출판 정보">
            <div>
              <ul>
                <li>
                  <strong>저자:</strong> {book.author || '저자 미상'}
                </li>
                <li>
                  <strong>출판년도:</strong> {book.published_year || '미상'}
                </li>
                <li>
                  <strong>ISBN:</strong> {book.isbn || '없음'}
                </li>
                {book.price && (
                  <li>
                    <strong>가격:</strong> {book.price.toLocaleString()}원
                  </li>
                )}
                {book.translator && (
                  <li>
                    <strong>번역자:</strong> {book.translator}
                  </li>
                )}
              </ul>
            </div>
          </Tab>
          <Tab eventKey="details" title="상세 정보">
            <div>
              <ul>
                <li>
                  <strong>평균 평점:</strong> {avgRating.toFixed(1)}점
                </li>
                <li>
                  <strong>평가 참여자:</strong> {ratingCount}명
                </li>
                {book.publisher && (
                  <li>
                    <strong>출판사:</strong> {book.publisher}
                  </li>
                )}
                {book.pages && (
                  <li>
                    <strong>페이지:</strong> {book.pages}쪽
                  </li>
                )}
                {book.language && (
                  <li>
                    <strong>언어:</strong> {book.language}
                  </li>
                )}
              </ul>
            </div>
          </Tab>
        </Tabs>
      </Card.Body>
    </Card>
  );
};

export default BookInfo;