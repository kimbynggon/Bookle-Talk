import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "./Button";
import Input from "./Input"
import "./AuthModal.scss";

const AuthModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("login");

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

  const [isUserIdChecked, setIsUserIdChecked] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [userIdMessage, setUserIdMessage] = useState("");
  const [nicknameMessage, setNicknameMessage] = useState("");

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  const isSignupValid =
    signupData.userId &&
    signupData.password &&
    signupData.confirmPassword &&
    signupData.email &&
    signupData.nickname &&
    isValidEmail(signupData.email) &&
    !passwordError &&
    isUserIdChecked &&
    isNicknameChecked;

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

  const checkUserId = async () => {
    try {
      const res = await axios.get("/api/auth/check-userid", {
        params: { userId: signupData.userId },
      });
      setUserIdMessage("사용 가능한 아이디입니다.");
      setIsUserIdChecked(true);
    } catch (err) {
      setUserIdMessage("이미 사용 중인 아이디입니다.");
      setIsUserIdChecked(false);
    }
  };

  const checkNickname = async () => {
    try {
      const res = await axios.get("/api/auth/check-nickname", {
        params: { nickname: signupData.nickname },
      });
      setNicknameMessage("사용 가능한 닉네임입니다.");
      setIsNicknameChecked(true);
    } catch (err) {
      setNicknameMessage("이미 사용 중인 닉네임입니다.");
      setIsNicknameChecked(false);
    }
  };

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
            <Button className="submit-btn" onClick={handleLogin}>
              로그인
            </Button>
            <div className="kakao-login">카카오톡 아이콘</div>
          </div>
        )}

        {activeTab === "signup" && (
          <div className="form signup-form">
            <div className="id-field">
              <Input
                type="text"
                label="아이디"
                value={signupData.userId}
                onChange={(e) => {
                  setSignupData({ ...signupData, userId: e.target.value });
                  setIsUserIdChecked(false);
                  setUserIdMessage("");
                }}
              />
              <button className="check-btn" onClick={checkUserId}>
                중복 확인
              </button>
            </div>
            {userIdMessage && (
              <div className="info-message">{userIdMessage}</div>
            )}

            <Input
              label="비밀번호"
              type="password"
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

            <Input
            label="이메일"
              type="text"
              value={signupData.email}
              onChange={(e) =>
                setSignupData({ ...signupData, email: e.target.value })
              }
            />
            {signupData.email && !isValidEmail(signupData.email) && (
              <div className="error-message">이메일 형식이 올바르지 않습니다</div>
            )}

            <div className="nickname-field">
              <Input
                type="text"
                label="닉네임"
                value={signupData.nickname}
                onChange={(e) => {
                  setSignupData({ ...signupData, nickname: e.target.value });
                  setIsNicknameChecked(false);
                  setNicknameMessage("");
                }}
              />
              <button className="check-btn" onClick={checkNickname}>
                중복 확인
              </button>
            </div>
            {nicknameMessage && (
              <div className="info-message">{nicknameMessage}</div>
            )}

            {serverError && (
              <div className="error-message">{serverError}</div>
            )}
            <Button
              className="submit-btn"
              disabled={!isSignupValid}
              onClick={handleSignup}
            >
              회원가입
            </Button>
            <div className="kakao-login">카카오톡 아이콘</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
