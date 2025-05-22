// fe/src/components/ChatSection.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Badge } from 'react-bootstrap';
import { Star } from 'lucide-react';
import { io } from 'socket.io-client';
import '../App.css';

export const ChatSection = ({ bookId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [isRatingError, setIsRatingError] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const chatRef = useRef(null);
  
  // Connect to socket when component mounts
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    
    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);
  
  // Join book room when socket is ready and bookId is available
  useEffect(() => {
    if (socket && bookId) {
      socket.on('connect', () => {
        setIsConnected(true);
        socket.emit('join_book', bookId);
      });
      
      socket.on('disconnect', () => {
        setIsConnected(false);
      });
      
      // Listen for new messages
      socket.on('receive_message', (message) => {
        setComments(prevComments => [...prevComments, message]);
      });
    }
  }, [socket, bookId]);
  
  // Load previous messages
  useEffect(() => {
    if (bookId) {
      fetch(`http://localhost:5000/api/books/${bookId}/chat`)
        .then(response => response.json())
        .then(data => {
          setComments(data);
        })
        .catch(error => {
          console.error('Error fetching chat messages:', error);
        });
    }
  }, [bookId]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [comments]);
  
  const 신고 = (messageId) => {
    if (window.confirm('이 메시지를 신고하시겠습니까?')) {
      fetch(`http://localhost:5000/api/messages/${messageId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1, // This should be the logged-in user's ID
          reason: '부적절한 내용',
        }),
      })
        .then(response => {
          if (response.ok) {
            alert('메시지가 신고되었습니다.');
          } else {
            alert('신고 처리 중 오류가 발생했습니다.');
          }
        })
        .catch(error => {
          console.error('Error reporting message:', error);
          alert('신고 처리 중 오류가 발생했습니다.');
        });
    }
  };
  
  const handleSubmit = () => {
    if (rating === 0) {
      setIsRatingError(true);
      return;
    }
    
    if (comment.trim() !== "" && socket && isConnected) {
      const messageData = {
        bookId: bookId || 1,
        userId: 1, // This should be the logged-in user's ID
        username: "사용자", // This should be the logged-in user's username
        rating: rating,
        comment: comment,
      };
      
      socket.emit('send_message', messageData);
      setComment("");
      setRating(0);
      setIsRatingError(false);
    }
  };

  return (
    <Card className="shadow-sm h-100">
      <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom">
        <h6 className="mb-0 fw-bold">북 토크 (채팅){!isConnected && ' - 연결 중...'}</h6>
      </Card.Header>
      
      {/* 채팅 메시지 영역 */}
      <div 
        ref={chatRef}
        className="p-3 bg-light" 
        style={{ height: '240px', overflowY: 'auto' }}
      >
        {comments.map((item) => (
          <div key={item.id} className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <div className="d-flex align-items-center">
                <span className="fw-bold me-2">{item.username}</span>
                <div className="d-flex text-warning">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" />
                  ))}
                </div>
              </div>
              <Button 
                variant="link" 
                className="p-0 text-danger" 
                onClick={() => 신고(item.id)}
                style={{ fontSize: '0.75rem' }}
              >
                신고
              </Button>
            </div>
            <Card className="shadow-sm mb-2">
              <Card.Body className="py-2 px-3">
                <small>{item.comment || item.message}</small>
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
        <div className="d-flex" style={{ flexWrap: 'wrap', gap: '10px', justifyContent: 'flex-end' }}>
          <Form.Control
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="이 책 재밌어요!"
            className="me-2 talk-input"
            style={{ marginRight: '0rem !important' }}
            disabled={!isConnected}
          />
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={!isConnected}
          >
            전송
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default ChatSection;