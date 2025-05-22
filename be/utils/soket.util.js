// utils/socket.util.js - 소켓 유틸리티 (실시간 채팅)

const { pool } = require('../database/init');

module.exports = (io) => {
  // 채팅방 관리를 위한 매핑
  const bookRooms = new Map();
  
  io.on('connection', (socket) => {
    console.log(`새 사용자 연결됨: ${socket.id}`);
    
    // 채팅방 참여 이벤트 처리
    socket.on('joinRoom', async ({ bookId, userId, username }) => {
      try {
        // 기존 방 나가기
        Object.keys(socket.rooms).forEach(room => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });
        
        const roomName = `book_${bookId}`;
        
        // 새 방 참여
        socket.join(roomName);
        
        // 방 정보 업데이트
        if (!bookRooms.has(roomName)) {
          bookRooms.set(roomName, new Set());
        }
        bookRooms.get(roomName).add({ userId, username, socketId: socket.id });
        
        // 이전 채팅 메시지 조회 (최근 50개)
        const chatResult = await pool.query(
          `SELECT c.id, c.message, c.created_at, u.username 
           FROM chats c 
           JOIN users u ON c.user_id = u.id 
           WHERE c.book_id = $1 
           ORDER BY c.created_at DESC 
           LIMIT 50`,
          [bookId]
        );
        
        const messages = chatResult.rows.reverse();
        
        // 방에 참여한 사용자 목록
        const users = Array.from(bookRooms.get(roomName)).map(u => ({
          userId: u.userId,
          username: u.username
        }));
        
        // 사용자에게 방 정보 전송
        socket.emit('roomJoined', { messages, users, bookId });
        
        // 다른 사용자들에게 새 사용자 참여 알림
        socket.to(roomName).emit('userJoined', { userId, username });
        
      } catch (error) {
        console.error('채팅방 참여 처리 중 오류 발생:', error);
        socket.emit('error', { message: '채팅방 참여 중 오류가 발생했습니다.' });
      }
    });
    
    // 채팅 메시지 전송 이벤트 처리
    socket.on('sendMessage', async ({ bookId, userId, message }) => {
      try {
        const roomName = `book_${bookId}`;
        
        // 데이터베이스에 메시지 저장
        const result = await pool.query(
          'INSERT INTO chats (book_id, user_id, message) VALUES ($1, $2, $3) RETURNING id, created_at',
          [bookId, userId, message]
        );
        
        const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
        const username = userResult.rows[0].username;
        
        const chatMessage = {
          id: result.rows[0].id,
          bookId,
          userId,
          username,
          message,
          created_at: result.rows[0].created_at
        };
        
        // 방에 있는 모든 사용자에게 메시지 전송
        io.to(roomName).emit('newMessage', chatMessage);
        
      } catch (error) {
        console.error('메시지 전송 처리 중 오류 발생:', error);
        socket.emit('error', { message: '메시지 전송 중 오류가 발생했습니다.' });
      }
    });
    
    // 사용자 연결 종료 이벤트 처리
    socket.on('disconnect', () => {
      console.log(`사용자 연결 종료: ${socket.id}`);
      
      // 모든 채팅방에서 사용자 제거
      bookRooms.forEach((users, roomName) => {
        const userToRemove = Array.from(users).find(u => u.socketId === socket.id);
        
        if (userToRemove) {
          users.delete(userToRemove);
          
          // 방에 있는 다른 사용자들에게 알림
          socket.to(roomName).emit('userLeft', {
            userId: userToRemove.userId,
            username: userToRemove.username
          });
          
          // 방이 비어있으면 방 제거
          if (users.size === 0) {
            bookRooms.delete(roomName);
          }
        }
      });
    });
  });
};