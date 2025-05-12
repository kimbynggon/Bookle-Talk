# 📚 BookTalk - 소셜 기반 도서 플랫폼

책을 읽고 리뷰하고, 유저들과 소통하는 도서 기반 커뮤니티 웹 애플리케이션입니다.

- 프론트엔드: React
- 백엔드: Node.js + Express + Socket.IO
- 데이터베이스: PostgreSQL (Sequelize ORM)
- 배포: AWS (S3, CloudFront, EC2, RDS)

---

## 🗂 프로젝트 구조

```bash
booktalk-app
├── backend
│ ├── models # Sequelize 모델 정의
│ ├── routes # REST API 라우터
│ ├── controllers # 요청 처리 로직
│ ├── services # 비즈니스 로직
│ ├── sockets # Socket.IO 실시간 채팅 처리
│ ├── config # DB 연결 및 설정
│ ├── middleware # 인증, 에러 핸들링 등
│ └── app.js # Express 앱 진입점
├── frontend
│ ├── pages # 주요 화면 페이지 (예: BookList, ChatRoom)
│ ├── components # 공통 UI 컴포넌트
│ ├── api # Axios 기반 API 요청 함수
│ └── App.jsx # 루트 컴포넌트
├── docs
│ ├── ERD.dbml # DB 구조
│ ├── flowchart.png # 사용자 플로우 차트
│ └── architecture.png # 아키텍처 다이어그램
├── .env.example # 환경 변수 템플릿
├── .gitignore # Git 추적 제외 설정
└── README.md
``` 

---

## ⚙️ 주요 기능

| 기능 | 설명 |
|------|------|
| 🔐 사용자 인증 | JWT 기반 회원가입, 로그인 |
| 📚 도서 목록 | 책 추가/검색/상세조회 |
| ⭐ 리뷰 작성 | 평점 + 리뷰 등록, 좋아요, 댓글(대댓글 포함) |
| 📌 북마크 | 관심 도서 저장 |
| 💬 실시간 채팅 | 책별 채팅방 생성 및 대화 (Socket.IO 기반) |

---

## 🚀 실행 방법

### 1️⃣ 프론트엔드 (React)
\`\`\`bash
cd frontend
npm install
npm start
\`\`\`
- 기본 포트: http://localhost:8080





---

## ☁️ AWS 배포 구성

| 구성 요소 | 서비스 |
|-----------|--------|
| 정적 웹 호스팅 | S3 + CloudFront |
| 백엔드 서버 | EC2 (Node.js + WebSocket) |
| 데이터베이스 | RDS (PostgreSQL) |
| 도메인 관리 (선택) | Route 53 |
| HTTPS 인증서 | ACM or Let's Encrypt |

---

## 🧠 사용 기술 스택

- **Frontend**: React, Axios, Socket.IO-client
- **Backend**: Express.js, Sequelize, Socket.IO
- **DB**: PostgreSQL (RDS), Sequelize ORM
- **DevOps**: AWS S3, CloudFront, EC2, RDS, Route53, dotenv
- **Tooling**: ESLint, nodemon

---

## 📌 향후 확장 계획

- ✅ 추천 시스템 연동 (협업 필터링 기반)
- ✅ 관리자 페이지 및 신고 기능
- ✅ FCM 기반 푸시 알림
- ✅ OAuth (Google, Kakao) 로그인

---
