import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { io } from 'socket.io-client';
import '../App.css';

// 더미 사용자 데이터 (컴포넌트 외부로 이동하여 의존성 문제 해결)
const DUMMY_USERS = [
  { id: 1, user_id: 'user001', nickname: '책읽는호랑이' },
  { id: 2, user_id: 'user002', nickname: '문학소녀' },
  { id: 3, user_id: 'user003', nickname: '북마니아' },
  { id: 4, user_id: 'user004', nickname: '소설탐험가' },
  { id: 5, user_id: 'user005', nickname: '역사학자' }
];

export const ChatSection = ({ bookId }) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const chatRef = useRef(null);
  
  // 백엔드 API URL
  const API_URL = process.env.REACT_APP_API_URL || '';
  const SOCKET_URL = 'http://localhost:8080';
  
  // 🔧 현재 사용자 설정 (무한 루프 방지)
  useEffect(() => {
    // 🔧 이미 사용자가 설정되어 있다면 중복 설정 방지
    if (currentUser) {
      console.log('👤 사용자 이미 설정됨:', currentUser.nickname);
      return;
    }

    // 임시로 랜덤 사용자 선택 또는 고정 사용자 사용
    const randomUser = DUMMY_USERS[Math.floor(Math.random() * DUMMY_USERS.length)];
    // 또는 고정 사용자: const fixedUser = DUMMY_USERS[0];
    
    setCurrentUser(randomUser);
    // console.log('🧪 ChatSection - 임시 사용자 설정:', randomUser);
  }, []); // 🔧 빈 의존성 배열로 한 번만 실행
  
  // Connect to socket when component mounts
  useEffect(() => {
    console.log('🔌 Socket 연결 시도:', SOCKET_URL);
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log('✅ Socket 연결 성공!', newSocket.id);
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket 연결 실패:', error);
    });
    
    return () => {
      newSocket.disconnect();
    };
  }, [SOCKET_URL]);
  
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
      fetch(`${API_URL}/api/books/${bookId}/chat`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setComments(data.data || []);
          }
        })
        .catch(error => {
          console.error('Error fetching chat messages:', error);
        });
    }
  }, [bookId, API_URL]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [comments]);
  
  const 신고 = (messageId) => {
    if (window.confirm('이 메시지를 신고하시겠습니까?')) {
      fetch(`${API_URL}/api/books/messages/${messageId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser?.id || 1,
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
    if (comment.trim() !== "" && socket && isConnected && currentUser) {
      const messageData = {
        bookId: bookId || 1,
        userId: currentUser.id,
        username: currentUser.nickname,
        comment: comment,
      };
      
      console.log('📤 메시지 전송:', messageData);
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

  // 사용자 전환 함수 (테스트용)
  const switchUser = (userId) => {
    const newUser = DUMMY_USERS.find(user => user.id === userId);
    if (newUser) {
      setCurrentUser(newUser);
      console.log('👤 사용자 전환:', newUser);
    }
  };

  return (
    <Card className="h-100">
      <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom">
        <h6 className="mb-0 fw-bold">
          북 토크 (채팅)
          {!isConnected && <span className="text-muted"> - 연결 중...</span>}
          {isConnected && <span className="text-success"> - 연결됨</span>}
        </h6>
        
        {/* 테스트용 사용자 전환 드롭다운 */}
        <div className="d-flex align-items-center">
          <span className="text-info me-2">
            {currentUser ? `${currentUser.nickname} (${currentUser.user_id})` : '로딩중...'}
          </span>
          <select 
            className="form-select form-select-sm" 
            style={{ width: 'auto', fontSize: '0.8rem' }}
            value={currentUser?.id || ''}
            onChange={(e) => switchUser(parseInt(e.target.value))}
          >
            {DUMMY_USERS.map(user => (
              <option key={user.id} value={user.id}>
                {user.nickname}
              </option>
            ))}
          </select>
        </div>
      </Card.Header>
      
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
                  <span className="fw-bold me-2">{item.username || '익명'}</span>
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
        {/* 댓글 입력 */}
        <div className="d-flex" style={{ gap: '10px' }}>
          <Form.Control
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력"
            className="talk-input"
            disabled={!isConnected || !currentUser}
            style={{ flex: 1 }}
          />
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={!isConnected || comment.trim() === "" || !currentUser}
          >
            전송
          </Button>
        </div>
        
        {!isConnected && (
          <div className="text-center mt-2">
            <small className="text-muted">서버에 연결 중입니다...</small>
          </div>
        )}
        
        {!currentUser && (
          <div className="text-center mt-2">
            <small className="text-warning">사용자 정보를 불러오는 중...</small>
          </div>
        )}
      </Card.Footer>
    </Card>
  );
};

export default ChatSection;