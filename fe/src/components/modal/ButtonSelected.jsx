import React, { useState } from 'react';
import styled from 'styled-components';

const ButtonSelected = () => {
  const [isActive, setIsActive] = useState(false);

  const toggleButton = () => {
    setIsActive(prev => !prev);
  };

  return (
    <StyledWrapper>
      <button onClick={toggleButton}>
        <span className={`button_top ${isActive ? 'active' : ''}`}>Button</span>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  button {
    --button_radius: 0.75em;
    --button_color: #e8e8e8;
    --button_outline_color: #000000;
    font-size: 17px;
    font-weight: bold;
    border: none;
    cursor: pointer;
    border-radius: var(--button_radius);
    background: var(--button_outline_color);
  }

  .button_top {
    display: block;
    box-sizing: border-box;
    border: 2px solid var(--button_outline_color);
    border-radius: var(--button_radius);
    padding: 0.75em 1.5em;
    background: var(--button_color);
    color: var(--button_outline_color);
    transform: translateY(-0.2em);
    transition: transform 0.1s ease;
  }

  button:hover .button_top {
    transform: translateY(-0.33em);
  }

  button:active .button_top {
    transform: translateY(0);
  }

  /* ✅ 활성화 상태 유지 시 */
  .button_top.active {
    transform: translateY(0);
  }
`;

export default ButtonSelected;
