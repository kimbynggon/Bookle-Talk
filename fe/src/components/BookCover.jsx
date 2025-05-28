import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import '../App.css';

const BookCover = ({ book }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!book) {
    return (
      <Card className="h-100 book-cover-card border-0">
        <Card.Body className="d-flex align-items-center justify-content-center">
          <span className="text-muted">책 정보를 불러오는 중...</span>
        </Card.Body>
      </Card>
    );
  }

  // 이미지 URL 결정
  const imageUrl = book.thumbnail || book.image || book.cover_image;
  
  // 이미지 로드 에러 처리
  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  // 이미지 로드 완료 처리
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // 대체 이미지 컴포넌트
  const PlaceholderImage = () => (
    <div 
      className="d-flex flex-column align-items-center justify-content-center text-muted book-cover-placeholder"
      style={{ 
        height: '300px', 
        backgroundColor: '#f8f9fa',
        border: '2px dashed #dee2e6',
        borderRadius: '8px'
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
      <div className="text-center">
        <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
          {book.title || '제목 없음'}
        </div>
        <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
          {book.authors || '저자 미상'}
        </div>
        <div style={{ fontSize: '0.7rem', marginTop: '0.5rem', opacity: 0.7 }}>
          이미지 없음
        </div>
      </div>
    </div>
  );

  return (
    <Card className="h-100 book-cover-card border-0">
      <div className="book-cover-img-container">
        {imageUrl && !imageError ? (
          <>
            {imageLoading && (
              <div 
                className="d-flex align-items-center justify-content-center text-muted"
                style={{ height: '300px', backgroundColor: '#f8f9fa' }}
              >
                <div className="text-center">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    이미지 로딩중...
                  </div>
                </div>
              </div>
            )}
            <Card.Img 
              variant="top" 
              src={imageUrl}
              alt={book.title || '책 표지'}
              className="book-cover-img"
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{ 
                display: imageLoading ? 'none' : 'block',
                maxHeight: '400px',
                objectFit: 'contain'
              }}
            />
          </>
        ) : (
          <PlaceholderImage />
        )}
      </div>
    </Card>
  );
};

export default BookCover;