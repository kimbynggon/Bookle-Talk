# 📚 BookTalk - 소셜 기반 도서 플랫폼

책을 읽고 리뷰하고, 유저들과 소통하는 도서 기반 커뮤니티 웹 애플리케이션입니다.
---
## 👥 팀원 소개

| 이름     | 역할              | 소개 |
|----------|-------------------|------|
|  유현욱 | 팀장  |메인페이지/ 로그인/회원가입 |
|  김병곤 | 팀원| 책 상세페이지 | 
|  한수빈 | 팀원 |책 리스트 |


---

## 🗂 프로젝트 구조

```bash
Bookle-Talk/                       
│
├── be/                                # 백엔드 (Node.js + Express + Sequelize)
│   ├── app.js                         # Express 앱의 진입점
│   ├── server.js                      # 서버 설정 및 소켓 통신
│   ├── socket.js                      # WebSocket 설정
│   ├── bin/                           # 서버 실행 스크립트
│   ├── config/                        # 설정 파일
│   │   ├── config.js                  # DB 및 환경 설정
│   │   └── kaka.js                    # 카카오 API 설정
│   ├── controllers/                   # 요청 핸들러
│   ├── dao/                           # Data Access Objects
│   ├── middleware/                    # 미들웨어
│   ├── migrations/                    # DB 테이블 자동생성 
│   ├── models/                        # Sequelize 모델
│   │   ├── user.js, book.js ...
│   ├── routes/                        # API 라우트 정의
│   ├── services/                      # 비즈니스 로직
│   ├── utils/                         # 유틸리티 함수
│   ├── views/                         # 서버 사이드 렌더링 뷰
│   ├── logs/                          # 로그 디렉토리
│   ├── book/, bruno_bookList/         # API 테스트 시나리오 (Bruno)
│
├── fe/                                # 프론트엔드 (React)
│   ├── public/                        # 정적 리소스
│   ├── src/
│   │   ├── api/                       # API 요청 모듈 (Axios)
│   │   ├── assets/                    # 이미지, 아이콘 등
│   │   ├── components/                # 공통 UI 컴포넌트
│   │   ├── pages/                     # 라우팅 페이지 구성
│   │   ├── router/                    # React Router 설정
│   │   └── App.jsx                    # 앱 루트
│   ├── .env                           # 환경 변수
│   └── package.json                   # 의존성 관리
```
---

#### 주요 컴포넌트 설명

1. **프론트엔드 (Client)**
   - **Pages**: 메인 페이지, 책 상세 페이지, 채팅 페이지 등 라우팅 기반 페이지 컴포넌트
   - **Components**: 재사용 가능한 UI 컴포넌트 (헤더, 네비게이션, 카드 등)
   - **API**: Axios를 통한 백엔드 통신
   - **Socket.IO-client**: 실시간 채팅 구현

2. **백엔드 (Server)**
   - **Controllers**: 
     - `authController`: 회원가입/로그인 처리
     - `bookController`: 도서 관련 CRUD
     - `chatController`: 채팅방 관리
     - `searchController`: 도서 검색
   - **Services**: 비즈니스 로직 처리
   - **Models**: Sequelize ORM 기반 데이터 모델
   - **Socket.IO**: 실시간 양방향 통신
   - **Middleware**: JWT 인증, 에러 처리 등

3. **데이터베이스 (Database)**
   - **Users**: 사용자 정보
   - **Books**: 도서 정보
   - **Chats**: 채팅방 및 메시지
   - **Likes**: 평점

4. **외부 서비스 (External Services)**
   - **Kakao Book API**: 도서 정보 API
#### 데이터 흐름
1. 클라이언트 요청 → Express 서버
2. 서버의 Controller에서 요청 처리
3. Service 레이어에서 비즈니스 로직 실행
4. Model을 통한 데이터베이스 작업
5. Socket.IO를 통한 실시간 통신
6. 외부 API 연동 (카카오, 도서 검색)

---

## ⚙️ 주요 기능

| 기능 | 설명 |
|------|------|
| 🔐 사용자 인증 | JWT 기반 회원가입, 로그인 |
| 📚 도서 목록 | 책 추가/검색/상세조회 |
| ⭐ 평점 작성 | 평점 작성|
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


## ERD
---
![bookletalk](https://github.com/user-attachments/assets/bcf9d430-fb68-47f8-9fdb-220a8a3c0f6f)
---

## 🧠 사용 기술 스택

- **Frontend**: 
  - React 19
  - React Router DOM 7
  - Axios
  - Socket.IO-client
  - React Bootstrap
  - Styled Components

- **Backend**: 
  - Node.js
  - Express.js
  - Sequelize ORM
  - Socket.IO
  - JWT (jsonwebtoken)

- **Database**: 
  - PostgreSQL
  - Sequelize CLI

- **DevOps & Tools**: 
  - dotenv (환경변수 관리)
  - ESLint
  - Prettier
  - Nodemon
  - Winston Daily Rotate File (로그 관리)

---

## 📌 향후 확장 계획

- ✅ 추천 시스템 연동 (협업 필터링 기반)
- ✅ 관리자 페이지 및 신고 기능
- ✅ FCM 기반 푸시 알림
- ✅ OAuth (Google, Kakao) 로그인
- ✅ 마이페이지(북마크, 정보수정, 회원탈퇴,채팅목록)

---
