import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Container, Card, Form, Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import ErrorAlert from "../components/ErrorAlert";

export default function LoginPage() {
  const { login, error, clearError, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    const from = (location.state as { from?: Location })?.from?.pathname || "/dashboard";
    navigate(from, { replace: true });
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!email || !password) {
      setFormError("Please enter your email and password.");
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/dashboard");
    } catch {
      // error surfaced via AuthContext's `error`
    } finally {
      setSubmitting(false);
    }
  }

  const displayError = formError || error;

  return (
    <Container className="py-5" style={{ maxWidth: 420 }}>
      <Card className="fmb-card">
        <Card.Body className="p-4">
          <h1 className="h4 mb-1">Welcome back</h1>
          <p className="fmb-muted small mb-4">Log in to continue your diagnosis.</p>

          {displayError && <ErrorAlert message={displayError} />}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100" disabled={submitting}>
              {submitting ? "Logging in…" : "Log In"}
            </Button>
          </Form>

          <p className="text-center small fmb-muted mt-3 mb-0">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}
