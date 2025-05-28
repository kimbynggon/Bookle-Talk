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
  const formatPrice = (price) => {
    if (!price || price === 0) return '정보 없음';
    return `${price.toLocaleString()}원`;
  };

  // 저자명 포맷팅
  const formatAuthors = (authors) => {
    if (!authors) return '정보 없음';
    if (Array.isArray(authors)) return authors.join(', ');
    return authors;
  };

  return (
    <Card>
      <Card.Header>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            {avgRating > 0 && (
              <>
                {[...Array(Math.round(avgRating))].map((_, i) => (
                  <Star key={i} size={16} fill="gold" color="gold" />
                ))}
                <span className="ms-2 text-muted">
                  평균 {avgRating.toFixed(1)}점
                  {ratingCount > 0 && ` (${ratingCount}명 참여)`}
                </span>
              </>
            )}
            {avgRating === 0 && (
              <span className="text-muted">아직 평점이 없습니다</span>
            )}
          </div>
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
              <div className="row">
                <div className="col-md-6">
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <strong>저자:</strong> {formatAuthors(book.authors)}
                    </li>
                    <li className="mb-2">
                      <strong>출판년도:</strong> {formatDate(book.datetime)}
                    </li>
                    <li className="mb-2">
                      <strong>출판사:</strong> {book.publisher || '정보 없음'}
                    </li>
                    <li className="mb-2">
                      <strong>ISBN:</strong> {book.isbn || '정보 없음'}
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <strong>가격:</strong> {formatPrice(book.price)}
                    </li>
                    {book.translators && (
                      <li className="mb-2">
                        <strong>번역자:</strong> {formatAuthors(book.translators)}
                      </li>
                    )}
                    {book.pages && (
                      <li className="mb-2">
                        <strong>페이지:</strong> {book.pages}쪽
                      </li>
                    )}
                    {book.language && (
                      <li className="mb-2">
                        <strong>언어:</strong> {book.language}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </Tab>
          
          <Tab eventKey="details" title="상세 정보">
            <div>
              <div className="row">
                <div className="col-md-6">
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <strong>평균 평점:</strong> 
                      <span className={`ms-2 ${avgRating > 0 ? 'text-warning' : 'text-muted'}`}>
                        {avgRating > 0 ? `${avgRating.toFixed(1)}점` : '평점 없음'}
                      </span>
                    </li>
                    <li className="mb-2">
                      <strong>평가 참여자:</strong> {ratingCount}명
                    </li>
                    {/* <li className="mb-2">
                      <strong>등록일:</strong> {formatDate(book.createdAt) || '정보 없음'}
                    </li> */}
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="list-unstyled">
                    {book.url && (
                      <li className="mb-2">
                        <strong>참조 링크:</strong> 
                        <a 
                          href={book.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ms-2 text-primary"
                        >
                          상세보기
                        </a>
                      </li>
                    )}
                    <li className="mb-2">
                      <strong>도서 ID:</strong> {book.id}
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* 평점 분포 (향후 확장용) */}
              {avgRating > 0 && (
                <div className="mt-3">
                  <h6>평점 분포</h6>
                  <div className="text-muted">
                    <small>평점 분포 차트는 향후 업데이트 예정입니다.</small>
                  </div>
                </div>
              )}
            </div>
          </Tab>
          
          {book.contents && (
            <Tab eventKey="description" title="책 소개">
              <div>
                <p className="text-muted">{book.contents}</p>
              </div>
            </Tab>
          )}
        </Tabs>
        
        {/* 추가 정보 뱃지들 */}
        <div className="mt-3">
          {book.price && book.price > 0 && (
            <Badge bg="info" className="me-2">유료</Badge>
          )}
          {book.translators && (
            <Badge bg="secondary" className="me-2">번역서</Badge>
          )}
          {avgRating >= 4.0 && (
            <Badge bg="warning" className="me-2">고평점</Badge>
          )}
          {ratingCount >= 10 && (
            <Badge bg="success" className="me-2">인기</Badge>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default BookInfo;