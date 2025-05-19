import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AuthModal.scss";

const AuthModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("login");


// 각 상태를 저장하는 코드
  const [loginData, setLoginData] = useState({
    userId: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");


  const [signupData, setSignupData] = useState({
    userId: "",
    password: "",
    confirmPassword: "",
    email: "",
    nickname: "",
  });
  const [passwordError, setPasswordError] = useState(false);
  const [serverError, setServerError] = useState("");

  // 폼 유효성 검사
  const isSignupValid =
    signupData.userId &&
    signupData.password &&
    signupData.confirmPassword &&
    signupData.email &&
    signupData.nickname &&
    !passwordError;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("auth-modal-overlay")) onClose();
  };

  useEffect(() => {
    if (
      signupData.password &&
      signupData.confirmPassword &&
      signupData.password !== signupData.confirmPassword
    ) {
      setPasswordError(true);
    } else {
      setPasswordError(false);
    }
  }, [signupData.password, signupData.confirmPassword]);

  const handleSignup = async () => {
    try {
      const res = await axios.post("/api/auth/signup", {
        userId: signupData.userId,
        password: signupData.password,
        email: signupData.email,
        nickname: signupData.nickname,
      });
      console.log("회원가입 성공:", res.data);
      setServerError("");
      setActiveTab("login"); 
    } catch (err) {
      setServerError(err.response?.data?.message || "회원가입 실패");
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("/api/auth/login", {
        userId: loginData.userId,
        password: loginData.password,
      });
  
      console.log("로그인 성공:", res.data);
  
     
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("nickname", res.data.user.nickname);
  
      setLoginError("");
      onClose(); 
      window.location.reload(); 
    } catch (err) {
      setLoginError(err.response?.data?.message || "로그인 실패");
    }
  };
  

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal">
        <div className="modal-header">
          <div className="tabs">
            <button
              className={activeTab === "login" ? "active" : ""}
              onClick={() => setActiveTab("login")}
            >
              로그인
            </button>
            <button
              className={activeTab === "signup" ? "active" : ""}
              onClick={() => setActiveTab("signup")}
            >
              회원가입
            </button>
          </div>
          <button className="close-btn" onClick={onClose}>
            닫기
          </button>
        </div>

        {/* 로그인 탭 */}
        {activeTab === "login" && (
          <div className="form login-form">
            <input
              type="text"
              placeholder="아이디"
              value={loginData.userId}
              onChange={(e) =>
                setLoginData({ ...loginData, userId: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
            />
            {loginError && <div className="error-message">{loginError}</div>}
            <button className="submit-btn" onClick={handleLogin}>
              로그인 버튼
            </button>
            <div className="kakao-login">카카오톡 아이콘</div>
          </div>
        )}

        {/* 회원가입 탭 */}
        {activeTab === "signup" && (
          <div className="form signup-form">
            <input
              type="text"
              placeholder="아이디"
              value={signupData.userId}
              onChange={(e) =>
                setSignupData({ ...signupData, userId: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={signupData.password}
              onChange={(e) =>
                setSignupData({ ...signupData, password: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="비밀번호 확인"
              value={signupData.confirmPassword}
              onChange={(e) =>
                setSignupData({
                  ...signupData,
                  confirmPassword: e.target.value,
                })
              }
            />
            {passwordError && (
              <div className="error-message">비밀번호가 다릅니다</div>
            )}
            <input
              type="email"
              placeholder="이메일"
              value={signupData.email}
              onChange={(e) =>
                setSignupData({ ...signupData, email: e.target.value })
              }
            />
            <div className="nickname-field">
              <input
                type="text"
                placeholder="닉네임"
                value={signupData.nickname}
                onChange={(e) =>
                  setSignupData({ ...signupData, nickname: e.target.value })
                }
              />
              <button className="check-btn">중복 확인</button>
            </div>
            {serverError && (
              <div className="error-message">{serverError}</div>
            )}
            <button
              className="submit-btn"
              disabled={!isSignupValid}
              onClick={handleSignup}
            >
              회원가입 버튼
            </button>
            <div className="kakao-login">카카오톡 아이콘</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
