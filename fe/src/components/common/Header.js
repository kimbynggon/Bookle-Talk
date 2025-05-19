import React, { useState, useEffect } from "react";
import "./style/Header.scss";
import AuthModal from "../modal/AuthModal";

const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nickname, setNickname] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedNickname = localStorage.getItem("nickname");
    console.log("저장된 JWT 토큰:", storedToken);
    if (storedToken && storedNickname) {
      setNickname(storedNickname);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("nickname");
    window.location.reload();
  };

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  return (
    <>
      <header className="header">
        <button className="logo">BookleTalk</button>
        <nav className="nav">
          {!nickname ? (
            <button className="auth-btn" onClick={handleModalOpen}>
              로그인/회원가입
            </button>
          ) : (
            <div className="user-info">
              <button className="alarm">알람</button>
              <span className="nickname">{nickname}님</span>
              <button className="logout" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          )}
        </nav>
      </header>

      {isModalOpen && <AuthModal onClose={handleModalClose} />}
    </>
  );
};

export default Header;
