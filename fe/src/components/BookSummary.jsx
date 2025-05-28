import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';

const BookSummary = ({ book }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!book) {
    return (
      <Card className="border-0 h-100">
        <Card.Body>
          <span className="text-muted">책 정보를 불러오는 중...</span>
        </Card.Body>
      </Card>
    );
  }

  // 책 소개 텍스트 가져오기
  const description = book.contents || book.summary || book.description || '';
  
  // 텍스트가 없는 경우
  if (!description.trim()) {
    return (
      <Card className="border-0 h-100">
        <Card.Body>
          <h5 className="card-title fw-bold mb-3">책 소개</h5>
          <div className="text-center py-4">
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📖</div>
            <p className="text-muted">
              이 책에 대한 소개가 아직 등록되지 않았습니다.
            </p>
            <small className="text-muted">
              카카오 도서 API에서 제공하는 정보가 없습니다.
            </small>
          </div>
        </Card.Body>
      </Card>
    );
  }

  // 텍스트 길이 제한 (300자)
  const maxLength = 300;
  const shouldTruncate = description.length > maxLength;
  const displayText = shouldTruncate && !isExpanded 
    ? description.substring(0, maxLength) + '...' 
    : description;

  return (
    <Card className="border-0 h-100">
      <Card.Body>
        <h5 className="card-title fw-bold mb-3">책 소개</h5>
        
        <div className="book-description" style={{ lineHeight: '1.6' }}>
          <p className="card-text text-muted mb-3">
            {displayText}
          </p>
          
          {/* 더보기/접기 버튼 */}
          {shouldTruncate && (
            <div className="text-center">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? '접기 ▲' : '더보기 ▼'}
              </Button>
            </div>
          )}
        </div>
        
        {/* 추가 정보 */}
        <div className="mt-3 pt-3 border-top">
          <div className="row text-muted small">
            {book.publisher && (
              <div className="col-md-6 mb-2">
                <strong>출판사:</strong> {book.publisher}
              </div>
            )}
            {book.datetime && (
              <div className="col-md-6 mb-2">
                <strong>출간:</strong> {new Date(book.datetime).getFullYear()}년
              </div>
            )}
            {book.authors && (
              <div className="col-md-6 mb-2">
                <strong>저자:</strong> {
                  Array.isArray(book.authors) 
                    ? book.authors.join(', ') 
                    : book.authors
                }
              </div>
            )}
            {book.translators && (
              <div className="col-md-6 mb-2">
                <strong>번역:</strong> {
                  Array.isArray(book.translators) 
                    ? book.translators.join(', ') 
                    : book.translators
                }
              </div>
            )}
            {book.price && (
              <div className="col-md-6 mb-2">
                <strong>가격:</strong> {
                  Array.isArray(book.price) 
                    ? book.price.join(', ') 
                    : book.price
                }
              </div>
            )}
            {book.isbn && (
              <div className="col-md-6 mb-2">
                <strong>isbn:</strong> {
                  Array.isArray(book.isbn) 
                    ? book.isbn.join(', ') 
                    : book.isbn
                }
              </div>
            )}
          </div>
        </div>
        
        {/* 외부 링크 */}
        {book.url && (
          <div className="mt-3 pt-3 border-top">
            <a 
              href={book.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline-secondary btn-sm"
            >
              원본 페이지에서 보기 🔗
            </a>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default BookSummary;