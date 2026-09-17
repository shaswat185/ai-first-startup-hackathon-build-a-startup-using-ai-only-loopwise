import { Link } from "react-router-dom";
import { Container, Button } from "react-bootstrap";

export default function NotFoundPage() {
  return (
    <Container className="text-center py-5">
      <h1 className="display-6">404</h1>
      <p className="fmb-muted">The page you're looking for doesn't exist.</p>
      <Button as={Link as any} to="/" variant="primary">
        Back to Home
      </Button>
    </Container>
  );
}
