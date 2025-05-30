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
  
  // ✅ 강화된 닉네임 정제 함수
  const cleanNickname = (nickname) => {
    if (!nickname) return '익명사용자';
    
    // 문제가 되는 문자들 제거
    let cleaned = nickname
      .replace(/[ᅟᅠ\u1160\u1161\u115F\u3164]/g, '') // 한글 채움 문자 제거
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // 제로 폭 문자 제거
      .replace(/[^\w\sㄱ-ㅎ가-힣\u4e00-\u9fff]/g, '') // 허용된 문자만 남기기
      .trim();
    
    // 빈 문자열이거나 너무 짧으면 기본값 사용
    if (!cleaned || cleaned.length < 1 || cleaned === 'undefined') {
      return '사용자' + Math.floor(Math.random() * 1000);
    }
    
    // 너무 긴 닉네임은 자르기
    if (cleaned.length > 20) {
      cleaned = cleaned.substring(0, 20);
    }
    
    return cleaned;
  };
  
  // ✅ 개선된 현재 사용자 설정 (localStorage 우선)
  useEffect(() => {
    if (!currentUser) {
      const token = localStorage.getItem('token');
      const nickname = localStorage.getItem('nickname');
      
      console.log('🔍 토큰에서 사용자 정보 추출 시도:', { hasToken: !!token, nickname });
      
      if (token && nickname) {
        try {
          // ✅ JWT 디코딩 시 한글 처리 강화
          const base64Payload = token.split('.')[1];
          // Base64 패딩 추가 (필요시)
          const paddedPayload = base64Payload + '='.repeat((4 - base64Payload.length % 4) % 4);
          
          let tokenPayload;
          try {
            // 방법 1: 일반 디코딩
            tokenPayload = JSON.parse(atob(paddedPayload));
          } catch (e) {
            // 방법 2: UTF-8 디코딩 시도
            const bytes = Uint8Array.from(atob(paddedPayload), c => c.charCodeAt(0));
            const decoder = new TextDecoder('utf-8');
            const decodedString = decoder.decode(bytes);
            tokenPayload = JSON.parse(decodedString);
          }
          
          console.log('🔓 JWT 페이로드:', tokenPayload);
          
          // ✅ localStorage 닉네임을 우선 사용
          let validNickname = nickname;
          
          // localStorage 닉네임이 정상인지 확인
          if (!validNickname || validNickname.includes('ᅟ') || validNickname.trim() === '' || validNickname === 'undefined') {
            // localStorage에 문제가 있으면 JWT에서 가져오기 (하지만 JWT도 문제가 있을 수 있음)
            validNickname = cleanNickname(tokenPayload.nickname);
          }
          
          // 여전히 문제가 있으면 기본 닉네임 사용
          if (!validNickname || validNickname === '익명사용자' || validNickname.includes('ᅟ')) {
            validNickname = '사용자' + Math.floor(Math.random() * 1000);
          }
          
          const userData = {
            id: tokenPayload.id || tokenPayload.user_id || validNickname,
            user_id: tokenPayload.user_id || tokenPayload.id || validNickname,
            nickname: validNickname
          };
          
          console.log('👤 최종 설정된 사용자 정보:', userData);
          setCurrentUser(userData);
        } catch (error) {
          console.error('토큰 파싱 오류:', error);
          // ✅ 토큰 파싱 실패 시 localStorage 정보를 그대로 사용
          let fallbackNickname = nickname || '익명사용자';
          
          // localStorage 닉네임이 정상이면 그대로 사용
          if (fallbackNickname && !fallbackNickname.includes('ᅟ') && fallbackNickname.trim() !== '') {
            // localStorage 닉네임이 정상
          } else {
            fallbackNickname = '사용자' + Math.floor(Math.random() * 1000);
          }
          
          const fallbackUser = {
            id: fallbackNickname,
            user_id: fallbackNickname,
            nickname: fallbackNickname
          };
          console.log('🔄 Fallback 사용자 정보:', fallbackUser);
          setCurrentUser(fallbackUser);
        }
      }
    } else {
      console.log('👤 Props에서 받은 사용자 정보:', currentUser);
    }
  }, [currentUser]);
  
  // Socket 연결
  useEffect(() => {
    if (!bookId) return;
    
    console.log('🔌 Socket 연결 시도:', SOCKET_URL);
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log('✅ Socket 연결 성공!');
      setIsConnected(true);
      newSocket.emit('join_room', bookId, () => {
        console.log('✅ join_room 완료됨');
      });      
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket 연결 실패:', error);
      setIsConnected(false);
      setError('실시간 채팅 연결에 실패했습니다.');
    });
    
    newSocket.on('disconnect', () => {
      console.log('🔌 Socket 연결 해제');
      setIsConnected(false);
    });
    
    // ✅ 수정된 메시지 수신 이벤트 리스너
    newSocket.on('receive_message', (message) => {
      console.log('📨 새 메시지 수신:', message);
      
      const newMessage = {
        id: message.id || Date.now(),
        nickname: cleanNickname(message.nickname || message.username),
        username: cleanNickname(message.username || message.nickname),
        message: message.message,
        comment: message.message,
        created_at: message.created_at || new Date().toISOString(),
        user_id: message.userId || message.user_id || '익명',
        book_id: message.bookId || bookId
      };
      
      console.log('✅ 정제된 메시지:', newMessage);
      
      setComments(prevComments => {
        // 중복 메시지 방지
        const exists = prevComments.some(msg => 
          msg.id === newMessage.id || 
          (msg.message === newMessage.message && 
           msg.user_id === newMessage.user_id && 
           Math.abs(new Date(msg.created_at) - new Date(newMessage.created_at)) < 1000)
        );
        
        if (!exists) {
          return [...prevComments, newMessage];
        }
        return prevComments;
      });
    });
    
    // ✅ 메시지 에러 처리
    newSocket.on('message_error', (error) => {
      console.error('📨 메시지 에러:', error);
      setError('메시지 전송 중 오류가 발생했습니다: ' + error.details);
    });
    
    return () => {
      newSocket.disconnect();
    };
  }, [bookId, SOCKET_URL]);
  
  // ✅ 개선된 기존 메시지 로드
  useEffect(() => {
    const loadMessages = async () => {
      if (!bookId || !API_URL) return;
      
      try {
        console.log('📥 기존 채팅 메시지 로드 시작');
        const response = await fetch(`${API_URL}/api/books/${bookId}/chat`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          console.log('✅ 기존 채팅 메시지 로드 완료:', data.data?.length || 0, '개');
          
          // ✅ 로드된 메시지들의 닉네임도 정제
          const cleanedMessages = (data.data || []).map(msg => ({
            ...msg,
            nickname: cleanNickname(msg.nickname || msg.username),
            username: cleanNickname(msg.username || msg.nickname)
          }));
          
          setComments(cleanedMessages);
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
  
  // ✅ 개선된 메시지 전송 (localStorage 닉네임 직접 사용)
  const handleSubmit = async () => {
    if (!comment.trim()) return;
    
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    // ✅ localStorage에서 직접 닉네임 가져오기 (깨지지 않은 상태)
    const realNickname = localStorage.getItem('nickname') || '익명';
    
    console.log('📤 메시지 전송 시도:', {
      bookId,
      currentUser,
      realNickname,
      message: comment.trim()
    });
    
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
            nickname: realNickname, // ✅ localStorage 닉네임 사용
            message: comment.trim()
          })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          setComments(prevComments => [...prevComments, data.data]);
          setComment("");
          console.log('✅ HTTP 메시지 전송 완료');
        } else {
          console.error('HTTP 메시지 전송 실패:', data);
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
        username: realNickname, // ✅ localStorage 닉네임 사용
        nickname: realNickname, // ✅ localStorage 닉네임 사용
        message: comment.trim(),
      };
      
      console.log('📤 Socket 메시지 전송:', messageData);
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
            닉네임: {localStorage.getItem('nickname') || currentUser.nickname || '관리자'}
          </span>
        </div>
      </Card.Header>
      
      {/* 에러 메시지 */}
      {error && (
        <Alert variant="warning" className="m-3" dismissible onClose={() => setError(null)}>
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
              {/* <div className="d-flex justify-content-between align-items-center mb-1">
                <div className="d-flex align-items-center">
                  <span className="fw-bold me-2">{cleanNickname(item.nickname || item.username)}</span>
                  <small className="text-muted">
                    {new Date(item.created_at).toLocaleString()}
                  </small>
                </div>
                {item.user_id !== currentUser.user_id && (
                  <Button 
                    variant="link" 
                    className="p-0 text-danger" 
                    onClick={() => handleReport(item.id)}
                    style={{ fontSize: '0.75rem' }}
                  >
                    신고
                  </Button>
                )}
              </div> */}
              <div 
                  className={`d-flex mb-3 ${item.user_id === currentUser.user_id ? 'justify-content-end text-end' : 'justify-content-start text-start'}`}
                >
                  <div style={{ maxWidth: '70%' }}>
                    {/* 닉네임 및 시간 */}
                    <div className={`small mb-1 ${item.user_id === currentUser.user_id ? 'text-end' : 'text-start'}`}>
                      <strong>{cleanNickname(item.nickname || item.username)}</strong>
                          {item.user_id !== currentUser.user_id && (
                            <Button 
                              variant="link" 
                              className="p-0 text-danger" 
                              onClick={() => handleReport(item.id)}
                              style={{ fontSize: '0.75rem', marginLeft: '5px' }}
                            >
                              신고
                            </Button>
                          )}
                      <br />
                      <span className="text-muted">{new Date(item.created_at).toLocaleString()}</span>
                      
                    </div>

                    {/* 말풍선 카드 */}
                    <Card 
                      bg={item.user_id === currentUser.user_id ? 'primary' : 'light'}
                      text={item.user_id === currentUser.user_id ? 'white' : 'dark'}
                      className="talk-bubble"
                    >
                      <Card.Body className="py-2 px-3">
                        <small>{item.comment || item.message}</small>
                      </Card.Body>
                    </Card>
                  </div>
                </div>
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