import React, { useState } from 'react';
import './style/Header.scss';
import AuthModal from '../modal/AuthModal'
const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  return (
    <>
      <header className="header">
        <button className="logo">BookleTalk</button>
        <nav className="nav">
          <button className="auth-btn" onClick={handleModalOpen}>
            로그인/회원가입
          </button>
        </nav>
      </header>

      {isModalOpen && <AuthModal onClose={handleModalClose} />}
    </>
  );
};

export default Header;