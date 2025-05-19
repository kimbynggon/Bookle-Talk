import { Button } from 'bootstrap';
import React from 'react';

const Header = () => {
  return (
    <header className="py-4 px-6 flex justify-between items-center border-b bg-white">
      <button className="text-xl font-semibold text-blue-600">BookleTalk</button>
      <nav className="flex space-x-4">
        <button className="px-3 py-1 text-gray-600 hover:text-gray-900">로그인</button>
        <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">회원가입</button>
      </nav>
    </header>
  );
};

export default Header;