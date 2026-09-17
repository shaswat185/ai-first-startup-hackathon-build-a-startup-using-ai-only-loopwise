import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Card, Badge } from "react-bootstrap";
import {
  Stethoscope,
  ClipboardList,
  TrendingUp,
  MessageSquareText,
  Store,
  Utensils,
  Briefcase,
  ShoppingCart,
  GraduationCap,
  HeartPulse,
} from "lucide-react";

const features = [
  {
    icon: MessageSquareText,
    title: "Describe your exact problem",
    text: "Tell us what's actually happening in your business — not a generic checklist, your specific situation.",
  },
  {
    icon: Stethoscope,
    title: "AI-powered diagnosis",
    text: "Our AI analyzes your business category, context, and metrics to identify likely causes as hypotheses, not guesses dressed up as facts.",
  },
  {
    icon: ClipboardList,
    title: "A 7-day action plan",
    text: "Specific, budget-aware tasks ordered across a week — each with an expected output so you know if it worked.",
  },
  {
    icon: TrendingUp,
    title: "Track real progress",
    text: "Check off tasks, add notes, and see your completion progress build over time across every diagnosis.",
  },
];

const categories = [
  { icon: Store, label: "Retail Store" },
  { icon: Utensils, label: "Restaurant / Café" },
  { icon: Briefcase, label: "Freelancer / Service" },
  { icon: ShoppingCart, label: "E-commerce" },
  { icon: GraduationCap, label: "Education / Coaching" },
  { icon: HeartPulse, label: "Healthcare / Wellness" },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="fmb-hero">
        <Container>
          <Badge bg="light" text="dark" className="border mb-3 px-3 py-2">
            AI-powered business advisor
          </Badge>
          <h1 className="display-5">
            Understand Your Business Problems. Take the Right Action.
          </h1>
          <p className="fmb-muted fs-5 mt-3" style={{ maxWidth: 640 }}>
            FixMyBusiness analyzes your specific business, exact problem, and budget to
            produce a customized diagnosis and a practical seven-day action plan —
            no generic advice, no fixed templates.
          </p>
          <div className="mt-4 d-flex gap-3 flex-wrap">
            <Button as={Link as any} to="/register" size="lg" variant="primary">
              Diagnose My Business
            </Button>
            <Button as={Link as any} to="/login" size="lg" variant="outline-secondary">
              Log In
            </Button>
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="fmb-section bg-white border-top border-bottom">
        <Container>
          <h2 className="h3 mb-4">How it works</h2>
          <Row className="g-4">
            {features.map((f, idx) => (
              <Col key={f.title} md={6} lg={3}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div className="fmb-feature-icon">
                    <f.icon size={20} />
                  </div>
                  <Badge bg="secondary" pill>
                    Step {idx + 1}
                  </Badge>
                </div>
                <h3 className="h6">{f.title}</h3>
                <p className="fmb-muted small mb-0">{f.text}</p>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Feature cards */}
      <section className="fmb-section">
        <Container>
          <h2 className="h3 mb-4">Built for how small businesses actually operate</h2>
          <Row className="g-4">
            <Col md={4}>
              <Card className="fmb-card h-100">
                <Card.Body>
                  <Card.Title className="h6">No assumed context</Card.Title>
                  <Card.Text className="fmb-muted small">
                    We never assume you have a website, employees, inventory, or social
                    media accounts. The AI only reasons from what you tell it.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="fmb-card h-100">
                <Card.Body>
                  <Card.Title className="h6">Evidence vs. assumptions</Card.Title>
                  <Card.Text className="fmb-muted small">
                    Every diagnosis clearly separates what's confirmed from what's
                    assumed, and flags what data would help confirm it.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="fmb-card h-100">
                <Card.Body>
                  <Card.Title className="h6">Budget-aware recommendations</Card.Title>
                  <Card.Text className="fmb-muted small">
                    Every recommendation and task respects the monthly budget you set —
                    no advice that assumes an unlimited marketing spend.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Business categories */}
      <section className="fmb-section bg-white border-top">
        <Container>
          <h2 className="h3 mb-4">Works across business types</h2>
          <Row className="g-3">
            {categories.map((c) => (
              <Col key={c.label} xs={6} md={4} lg={2}>
                <div className="fmb-card p-3 h-100 text-center">
                  <c.icon size={22} className="mb-2 text-primary" />
                  <div className="small fw-medium">{c.label}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA */}
      <section className="fmb-section">
        <Container className="text-center">
          <h2 className="h3">Ready to see what's actually going on?</h2>
          <p className="fmb-muted">Create a free account and diagnose your first problem in minutes.</p>
          <Button as={Link as any} to="/register" size="lg" variant="primary">
            Get Started Free
          </Button>
        </Container>
      </section>

      <footer className="fmb-footer">
        <Container className="d-flex justify-content-between flex-wrap gap-2">
          <span>© {new Date().getFullYear()} FixMyBusiness</span>
          <span>AI-generated guidance — not a guarantee of results.</span>
        </Container>
      </footer>
    </div>
  );
}
