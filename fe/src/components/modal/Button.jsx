import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  --color: #0077ff;
  font-family: inherit;
  display: inline-block;
  width: 5.5em;
  height: 2.5em;
  text-align: center !important;
  line-height: 2.5em;
  overflow: hidden;
  cursor: pointer;
  margin: 20px auto 0;
  font-size: 15px;
  z-index: 1;
  color: var(--color);
  border: 2px solid var(--color);
  border-radius: 6px;
  position: relative;
  background: transparent;

  &::before {
    position: absolute;
    content: "";
    background: var(--color);
    width: 150px;
    height: 200px;
    z-index: -1;
    border-radius: 50%;
    top: 100%;
    left: 100%;
    transition: 0.3s all;
  }

  &:hover {
    color: white;
  }

  &:hover::before {
    top: -30px;
    left: -30px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Button = ({ children, ...props }) => {
  return <StyledButton {...props}>{children}</StyledButton>;
};

export default Button;
