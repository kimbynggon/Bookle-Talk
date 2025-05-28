import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './style/Footer.scss'

const Footer = () => {
  return (
    <footer className="bg-light py-4 border-top mt-auto">
      <Container>
        <Row>
          <Col md={6}>
            <h6>BookleTalk</h6>
            <p className="text-muted">
              실시간으로 책에 대해 이야기하고 의견을 나눌 수 있는 플랫폼입니다.
            </p>
          </Col>
          <Col md={3}>
            {/* <h6>링크</h6>
            <ul className="list-unstyled">
              <li><a href="/about" className="text-decoration-none">소개</a></li>
              <li><a href="/terms" className="text-decoration-none">이용약관</a></li>
              <li><a href="/privacy" className="text-decoration-none">개인정보처리방침</a></li>
            </ul> */}
          </Col>
          <Col md={3}>
            <h6>연락처</h6>
            <address className="text-muted">
              <small>
                이메일: contact@bookletalk.com<br />
                전화: 02-123-4567<br />
                서울특별시 강남구
              </small>
            </address>
          </Col>
        </Row>
        <hr />
        <div className="text-center text-muted">
          <small>&copy; {new Date().getFullYear()} BookleTalk. All rights reserved.</small>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;