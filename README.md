# 📚 BookTalk - 소셜 기반 도서 플랫폼

책을 읽고 리뷰하고, 유저들과 소통하는 도서 기반 커뮤니티 웹 애플리케이션입니다.



---

## 🗂 프로젝트 구조

```bash
Bookle-Talk/                       
│
├── be/                                # 백엔드 (Node.js + Express + Sequelize)
│   ├── app.js                         # Express 앱의 진입점
│   ├── bin/www                        # 서버 실행 스크립트
│   ├── config/                        # 설정 파일
│   │   ├── config.js                  # DB 및 환경 설정
│   │   └── kaka.js                    # 카카오 API 설정
│   ├── controllers/                   # 요청 핸들러
│   │   ├── authController.js          # 회원가입 / 로그인
│   │   ├── bookController.js          # 책 관련 로직
│   │   ├── chatController.js          # 채팅 관련 로직
│   │   └── searchController.js        # 검색 로직
│   ├── dao/
│   │   └── userDao.js                 # 사용자 DB 접근 객체
│   ├── middleware/
│   │   └── authMiddleware.js          # 인증 미들웨어 (JWT)
│   ├── migrations/                    # DB 테이블 생성 내역
│   │   ├── create-user.js             # users
│   │   ├── create-book.js             # books
│   │   ├── create-chat.js             # chats
│   │   ├── create-like.js             # likes
│   │   └── create-bookmark.js         # bookmarks
│   ├── models/                        # Sequelize 모델
│   │   ├── user.js, book.js ...
│   ├── logs/                          # 로그 디렉토리
│   │   ├── combined.log
│   │   └── error.log
│   ├── book/, bruno_bookList/         # API 테스트 시나리오 (Bruno)
│   └── index.html                     # 테스트용 HTML
│
├── fe/                                # 프론트엔드 (React)
│   ├── public/                        # 정적 리소스
│   ├── src/
│   │   ├── api/                       # API 요청 모듈 (Axios)
│   │   ├── assets/                    # 이미지, 아이콘 등
│   │   ├── components/               # 공통 UI 컴포넌트
│   │   ├── pages/                    # 라우팅 페이지 구성
│   │   ├── router/                   # React Router 설정
│   │   ├── store/                    # Zustand 기반 전역 상태 관리
│   │   ├── styles/                   # SCSS 스타일링
│   │   ├── utils/                    # 공통 유틸 함수
│   │   └── App.jsx                   # 앱 루트
│   ├── .env                          # 환경 변수
│  

``` 

---

## ⚙️ 주요 기능

| 기능 | 설명 |
|------|------|
| 🔐 사용자 인증 | JWT 기반 회원가입, 로그인 |
| 📚 도서 목록 | 책 추가/검색/상세조회 |
| ⭐ 평점 작성 | 평점 작성|
| 📌 북마크 | 관심 도서 저장 |
| 💬 실시간 채팅 | 책별 채팅방 생성 및 대화 (Socket.IO 기반) |

---

## 🚀 실행 방법

### 1️⃣ 프론트엔드 (React)
```bash
cd fe
npm install
npm start
```
- 기본 포트: http://localhost:3000

### 2️⃣ 백엔드 실행
```bash
cd be
npm install
npm run dev
```
- 기본 포트: http://localhost:8080


## RDB
![RDB](https://github.com/user-attachments/assets/6ddeaa27-af39-44fc-ab7a-d3dc85134af3)




## 🧠 사용 기술 스택

- **Frontend**: React, Axios, Socket.IO-client
- **Backend**: Express.js, Sequelize, Socket.IO
- **DB**: PostgreSQL (RDS), Sequelize ORM
- **DevOps**: dotenv
- **Tooling**: ESLint, nodemon

---

## 📌 향후 확장 계획

- ✅ 추천 시스템 연동 (협업 필터링 기반)
- ✅ 관리자 페이지 및 신고 기능
- ✅ FCM 기반 푸시 알림
- ✅ OAuth (Google, Kakao) 로그인

---
