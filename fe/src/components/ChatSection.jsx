// src/components/ChatSection.jsx
import React, { useState } from 'react';
import { Card, Form, Button, Badge } from 'react-bootstrap';
import { Star } from 'lucide-react';
import '../App.css';

export const ChatSection = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      username: "낙네임",
      rating: 4,
      comment: "책이 새로 나왔군요!",
    },
    {
      id: 2,
      username: "낙네임",
      rating: 4,
      comment: "이 책 재미있나요?",
    },
  ]);
  const [isRatingError, setIsRatingError] = useState(false);
  const 경고 =() =>{
    alert("준비중입니다.");
  }
  const handleSubmit = () => {
    if (rating === 0) {
      setIsRatingError(true);
      return;
    }
    
    if (comment.trim() !== "") {
      setComments([
        ...comments,
        {
          id: comments.length + 1,
          username: "사용자",
          rating: rating,
          comment: comment,
        },
      ]);
      setComment("");
      setIsRatingError(false);
    }
  };

  return (
    <Card className="shadow-sm h-100">
      <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom">
        <h6 className="mb-0 fw-bold">북 토크 (채팅)</h6>
        <Button variant="outline-danger" onClick={경고}>신고</Button>
      </Card.Header>
      
      {/* 채팅 메시지 영역 */}
      <div className="p-3 bg-light" style={{ height: '240px', overflowY: 'auto' }}>
        {comments.map((item) => (
          <div key={item.id} className="mb-3">
            <div className="d-flex align-items-center mb-1">
              <span className="fw-bold me-2">{item.username}</span>
              <div className="d-flex text-warning">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} size={12} fill="currentColor" />
                ))}
              </div>
            </div>
            <Card className="shadow-sm mb-2">
              <Card.Body className="py-2 px-3">
                <small>{item.comment}</small>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
      
      {/* 별점 선택 */}
      <Card.Footer className="bg-white">
        <div className="d-flex align-items-center mb-2">
          <span className="me-2">별점:</span>
          <div className="d-flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star}
                size={16}
                className="me-1"
                color={star <= rating ? "#FFB900" : "#ADB5BD"}
                fill={star <= rating ? "#FFB900" : "none"}
                onClick={() => setRating(star)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
          {isRatingError && (
            <Badge bg="danger" className="ms-2">별점을 선택해주세요</Badge>
          )}
        </div>
        
        {/* 댓글 입력 */}
        <div className="d-flex" style={{ flexWrap: 'wrap', gap: '10px', justifyContent:'flex-end' }}>
          <Form.Control
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="이 책 재밌어요!"
            className="me-2 talk-input"
            style={{ marginRight: '0rem !important' }}
          />
          <Button variant="primary" onClick={handleSubmit}>
            전송
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
};
export default ChatSection;