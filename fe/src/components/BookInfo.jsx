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
  const avgRating = typeof rawAvgRating === 'number' ? parseFloat(rawAvgRating) : 0;
  const ratingCount = book.rating_count || book.likes?.length || 0;

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '미상';
    try {
      const date = new Date(dateString);
      return date.getFullYear();
    } catch {
      return dateString;
    }
  };

  // 가격 포맷팅
  
};

export default BookInfo;