import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SearchForm from '../SearchForm';

const Header = () => {
  return (
    <Navbar bg="light" expand="lg" className="border-bottom">
      <Container>
        <Navbar.Brand as={Link} to="/">BookleTalk</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {/* <Nav className="me-auto">
            <Nav.Link as={Link} to="/">홈</Nav.Link>
            <Nav.Link as={Link} to="/category">카테고리</Nav.Link>
            <Nav.Link as={Link} to="/new">신작</Nav.Link>
          </Nav>
          <SearchForm /> */}
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/login">로그인</Nav.Link>
            <Nav.Link as={Link} to="/signup">회원가입</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;