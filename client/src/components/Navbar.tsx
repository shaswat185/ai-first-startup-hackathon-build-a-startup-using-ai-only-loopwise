import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <Navbar expand="lg" className="fmb-navbar" sticky="top">
      <Container>
        <Navbar.Brand as={Link as any} to={user ? "/dashboard" : "/"} className="fmb-brand">
          FixMyBusiness
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          {user ? (
            <>
              <Nav className="me-auto">
                <Nav.Link as={Link as any} to="/dashboard">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link as any} to="/diagnose">
                  New Diagnosis
                </Nav.Link>
                <Nav.Link as={Link as any} to="/history">
                  History
                </Nav.Link>
                <Nav.Link as={Link as any} to="/settings">
                  Settings
                </Nav.Link>
              </Nav>
              <Nav className="align-items-lg-center gap-2">
                <span className="fmb-muted small">{user.name}</span>
                <Button size="sm" variant="outline-secondary" onClick={handleLogout}>
                  Log Out
                </Button>
              </Nav>
            </>
          ) : (
            <Nav className="ms-auto gap-2">
              <Nav.Link as={Link as any} to="/login">
                Log In
              </Nav.Link>
              <Button as={Link as any} to="/register" size="sm" variant="primary">
                Get Started
              </Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
