import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { io } from 'socket.io-client';
import '../App.css';

export const ChatSection = ({ bookId, currentUser: propCurrentUser }) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(propCurrentUser || null);
  const [error, setError] = useState(null);
  const chatRef = useRef(null);
  
  // 백엔드 API URL
  const API_URL = process.env.REACT_APP_API_URL || '';
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8080';
  
  // 현재 사용자 설정 (props에서 받지 못한 경우)
  useEffect(() => {
    if (!currentUser) {
      const token = localStorage.getItem('token');
      const nickname = localStorage.getItem('nickname');
      
      if (token && nickname) {
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          setCurrentUser({
            id: tokenPayload.id,
            user_id: tokenPayload.user_id,
            nickname: tokenPayload.nickname || nickname
          });
        } catch (error) {
          console.error('토큰 파싱 오류:', error);
          setError('인증 정보가 유효하지 않습니다. 다시 로그인해주세요.');
        }
      }
    }
  }, [currentUser]);
  
  // Socket 연결
  useEffect(() => {
    if (!bookId) return;
    
    // console.log('🔌 Socket 연결 시도:', SOCKET_URL);
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log('✅ Socket 연결 성공!');
      setIsConnected(true);
      newSocket.emit('join_room', bookId);
    });
    
    newSocket.on('connect_error', (error) => {
      // console.error('❌ Socket 연결 실패:', error);
      setIsConnected(false);
      setError('실시간 채팅 연결에 실패했습니다.');
    });
    
    newSocket.on('disconnect', () => {
      // console.log('🔌 Socket 연결 해제');
      setIsConnected(false);
    });
    
    // 새로운 메시지 수신
    newSocket.on('receive_message', (message) => {
      // console.log('📨 새 메시지 수신:', message);
      setComments(prevComments => [...prevComments, {
        id: Date.now(), // 임시 ID
        username: message.username,
        message: message.message,
        comment: message.message,
        created_at: message.created_at || new Date().toISOString(),
        user_id: message.userId || '익명',
        book_id: message.bookId
      }]);
    });
    
    return () => {
      newSocket.disconnect();
    };
  }, [bookId, SOCKET_URL]);
  
  // 기존 메시지 로드
  useEffect(() => {
    const loadMessages = async () => {
      if (!bookId || !API_URL) return;
      
      try {
        const response = await fetch(`${API_URL}/api/books/${bookId}/chat`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          setComments(data.data || []);
        } else {
          console.error('채팅 메시지 로드 실패:', data.message);
        }
      } catch (error) {
        console.error('채팅 메시지 로드 오류:', error);
        setError('채팅 기록을 불러오는데 실패했습니다.');
      }
    };

    loadMessages();
  }, [bookId, API_URL]);
  
  // 자동 스크롤
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [comments]);
  
  // 메시지 신고
  const handleReport = async (messageId) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    if (window.confirm('이 메시지를 신고하시겠습니까?')) {
      try {
        const response = await fetch(`${API_URL}/api/messages/${messageId}/report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser.user_id,
            reason: '부적절한 내용',
          }),
        });
        
        if (response.ok) {
          alert('메시지가 신고되었습니다.');
        } else {
          alert('신고 처리 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('신고 처리 오류:', error);
        alert('신고 처리 중 오류가 발생했습니다.');
      }
    }
  };
  
  // 메시지 전송
  const handleSubmit = async () => {
    if (!comment.trim()) return;
    
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    if (!isConnected) {
      // Socket이 연결되지 않은 경우 HTTP API 사용
      try {
        const response = await fetch(`${API_URL}/api/books/${bookId}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser.user_id,
            message: comment.trim()
          })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          setComments(prevComments => [...prevComments, data.data]);
          setComment("");
        } else {
          alert('메시지 전송에 실패했습니다.');
        }
      } catch (error) {
        console.error('메시지 전송 오류:', error);
        alert('메시지 전송 중 오류가 발생했습니다.');
      }
    } else {
      // Socket을 통한 실시간 전송
      const messageData = {
        bookId: bookId,
        userId: currentUser.user_id,
        username: currentUser.nickname,
        message: comment.trim(),
      };
      
      // console.log('📤 메시지 전송:', messageData);
      socket.emit('send_message', messageData);
      setComment("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 로그인하지 않은 사용자를 위한 안내
  if (!currentUser) {
    return (
      <Card className="h-100">
        <Card.Header className="bg-white border-bottom">
          <h6 className="mb-0 fw-bold">북 토크 (채팅)</h6>
        </Card.Header>
        <Card.Body className="d-flex align-items-center justify-content-center">
          <Alert variant="info" className="text-center">
            <Alert.Heading>로그인이 필요합니다</Alert.Heading>
            <p>채팅에 참여하려면 로그인해주세요.</p>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="h-100">
      <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom">
        <h6 className="mb-0 fw-bold">
          북 토크 (채팅)
          {!isConnected && <span className="text-muted"> - 연결 중...</span>}
          {isConnected && <span className="text-success"> - 실시간 연결됨</span>}
        </h6>
        
        <div className="d-flex align-items-center">
          <span className="text-info me-2">
          닉네임 : {currentUser.nickname}
          </span>
        </div>
      </Card.Header>
      
      {/* 에러 메시지 */}
      {error && (
        <Alert variant="warning" className="m-3">
          {error}
        </Alert>
      )}
      
      {/* 채팅 메시지 영역 */}
      <div 
        ref={chatRef}
        className="p-3 bg-light" 
        style={{ height: '240px', overflowY: 'auto' }}
      >
        {comments.length === 0 ? (
          <div className="text-center text-muted py-4">
            <p>아직 채팅이 없습니다.</p>
            <p>첫 번째 메시지를 남겨보세요! 📝</p>
          </div>
        ) : (
          comments.map((item, index) => (
            <div key={item.id || index} className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div className="d-flex align-items-center">
                  <span className="fw-bold me-2">{item.nickname}</span>
                  <small className="text-muted">
                    {new Date(item.created_at).toLocaleString()}
                  </small>
                </div>
                {item.user_id !== currentUser.id && (
                  <Button 
                    variant="link" 
                    className="p-0 text-danger" 
                    onClick={() => handleReport(item.id)}
                    style={{ fontSize: '0.75rem' }}
                  >
                    신고
                  </Button>
                )}
              </div>
              <Card className="mb-2">
                <Card.Body className="py-2 px-3">
                  <small>{item.comment || item.message}</small>
                </Card.Body>
              </Card>
            </div>
          ))
        )}
      </div>
      
      {/* 메시지 입력 */}
      <Card.Footer className="bg-white">
        <div className="d-flex" style={{ gap: '10px' }}>
          <Form.Control
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요"
            className="talk-input"
            disabled={!currentUser}
            style={{ flex: 1 }}
          />
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={comment.trim() === "" || !currentUser}
          >
            전송
          </Button>
        </div>
        
        {!isConnected && currentUser && (
          <div className="text-center mt-2">
            <small className="text-muted">
              실시간 연결이 끊어졌습니다. 메시지는 여전히 전송됩니다.
            </small>
          </div>
        )}
      </Card.Footer>
    </Card>
  );
};

export default ChatSection;