import React from "react";
import styled, { css } from "styled-components";

const Input = ({
  type = "text",
  label,
  value,
  onChange,
  message = "",
  messageType = "",
  className = "",
  ...props
}) => {
  return (
    <StyledWrapper>
      <div className="input-wrapper">
        <input
          required
          type={type}
          className={`input ${className}`}  // ✅ 기본 'input' 클래스 병합
          value={value}
          onChange={onChange}
          {...props}
        />
        <label className={value ? "filled" : ""}>{label}</label>
        {message && <span className={`msg ${messageType}`}>{message}</span>}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  width: 100%;

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  .input {
    font-size: 14px;
    padding: 12px 12px;
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 12px;
    background: white;
    transition: border 0.2s ease;
  }

  .input:focus {
    outline: none;
    border-color: #5264ae;
  }

  /* ✅ 외부에서 전달된 className에 따라 조건부 스타일 적용 */
  .input.left-rounded {
    border-radius: 10px 0 0 10px !important;
    border-right: none;
  }

  .input.right-rounded {
    border-radius: 0 10px 10px 0 !important;
    border-left: none;
  }

  label {
    position: absolute;
    left: 14px;
    top: 0%;
    transform: translateY(-50%);
    color: #999;
    font-size: 14px;
    pointer-events: none;
    transition: 0.2s ease all;
    background: white;
    padding: 0 4px;
  }

  .input:focus + label,
  .filled {
    top: -8px;
    font-size: 10px;
    color: #5264ae;
  }

  .msg {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 11px;
    padding-left: 8px;
  }

  .msg.info {
    color: #357edd;
  }

  .msg.error {
    color: #e53935;
  }
`;

export default Input;
