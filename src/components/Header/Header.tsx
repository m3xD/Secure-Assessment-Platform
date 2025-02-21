import React from "react";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Header.scss";
import { useAuth } from "../../hooks/useAuth";

const Header = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <Navbar expand="lg" className="header">
      <Container>
        <Navbar.Brand href="/">Quiz Monitor</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {authState.isAuthenticated ? (
            <>
              <Nav className="me-auto">
                {authState.user?.role === "student" ? (
                  <>
                    <Nav.Link href="/student/dashboard">Dashboard</Nav.Link>
                    <Nav.Link href="/student/quizzes">My Quizzes</Nav.Link>
                  </>
                ) : (
                  <>
                    <Nav.Link href="/teacher/dashboard">Dashboard</Nav.Link>
                    <Nav.Link href="/teacher/quizzes">Manage Quizzes</Nav.Link>
                    <Nav.Link href="/teacher/monitoring">Monitor</Nav.Link>
                  </>
                )}
              </Nav>
              <Nav>
                <NavDropdown
                  title={authState.user?.name || "User"}
                  id="basic-nav-dropdown"
                >
                  <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
                  <NavDropdown.Item href="/settings">Settings</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </>
          ) : (
            <Nav className="ms-auto">
              <Nav.Link href="/signin">Sign In</Nav.Link>
              <Nav.Link href="/signup">Sign Up</Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
