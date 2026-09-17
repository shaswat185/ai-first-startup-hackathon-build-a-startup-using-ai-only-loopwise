import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Card, Form, Row, Col, Button } from "react-bootstrap";
import PageHeader from "../components/PageHeader";
import ErrorAlert from "../components/ErrorAlert";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import BusinessCard from "../components/BusinessCard";
import { businessApi } from "../services/businessApi";
import { diagnosisApi, type DiagnosisInput } from "../services/diagnosisApi";
import { getApiErrorMessage } from "../services/apiClient";
import type { BusinessProfile, Severity } from "../types";
import { Building2 } from "lucide-react";

const EXAMPLE_PROBLEMS = [
  "Customer visits decreased",
  "Sales conversion is low",
  "Too many cancellations",
  "Customers are not returning",
  "Marketing is not producing results",
  "Costs are increasing",
  "Orders are delayed",
  "Website leads are low",
  "Staff productivity is poor",
  "Inventory is not moving",
  "Bookings are decreasing",
  "Customer complaints increased",
];

export default function DiagnosePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [businessId, setBusinessId] = useState(searchParams.get("businessId") || "");
  const [problem, setProblem] = useState("");
  const [problemDuration, setProblemDuration] = useState("");
  const [severity, setSeverity] = useState<Severity>("Medium");
  const [recentChanges, setRecentChanges] = useState("");
  const [previousAttempts, setPreviousAttempts] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [currentMetrics, setCurrentMetrics] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    businessApi
      .list()
      .then((list) => {
        setBusinesses(list);
        if (!businessId && list.length > 0) setBusinessId(list[0].id);
      })
      .catch((err) => setLoadError(getApiErrorMessage(err)))
      .finally(() => setLoadingBusinesses(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!businessId) {
      setError("Please select which business this problem is about.");
      return;
    }
    if (problem.trim().length < 5) {
      setError("Please describe the exact problem in a bit more detail.");
      return;
    }
    if (!problemDuration.trim()) {
      setError("Please tell us when the problem started.");
      return;
    }

    const payload: DiagnosisInput = {
      businessId,
      problem: problem.trim(),
      problemDuration: problemDuration.trim(),
      severity,
      recentChanges: recentChanges.trim(),
      previousAttempts: previousAttempts.trim(),
      desiredOutcome: desiredOutcome.trim(),
      additionalContext: additionalContext.trim(),
      currentMetrics: currentMetrics.trim(),
    };

    setSubmitting(true);
    try {
      const diagnosis = await diagnosisApi.create(payload);
      navigate(`/diagnosis/${diagnosis.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setSubmitting(false);
    }
  }

  if (loadingBusinesses) return <LoadingSpinner label="Loading your businesses…" />;
  if (loadError) return <ErrorAlert message={loadError} />;

  if (businesses.length === 0) {
    return (
      <EmptyState
        icon={<Building2 size={36} />}
        title="Set up a business first"
        message="Before we can diagnose a problem, we need to know a bit about your business."
        action={
          <Button as={Link as any} to="/business-setup" variant="primary">
            Set Up Your Business
          </Button>
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Describe Your Business Problem"
        subtitle="Be as specific as possible — the more detail, the sharper the diagnosis."
      />

      {error && <ErrorAlert message={error} />}

      {submitting && (
        <div className="mb-3">
          <LoadingSpinner label="Analyzing your business and problem — this can take a few seconds…" />
        </div>
      )}

      <Form onSubmit={handleSubmit}>
        <Card className="fmb-card mb-3">
          <Card.Body>
            <Card.Title className="h6 mb-3">1. Which business is this about?</Card.Title>
            <Row className="g-3">
              {businesses.map((b) => (
                <Col key={b.id} md={6} lg={4}>
                  <BusinessCard business={b} selected={b.id === businessId} onClick={() => setBusinessId(b.id)} />
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>

        <Card className="fmb-card mb-3">
          <Card.Body>
            <Card.Title className="h6 mb-3">2. What's the exact problem?</Card.Title>
            <Form.Group className="mb-2">
              <Form.Control
                as="textarea"
                rows={2}
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Describe exactly what's happening — e.g. 'Repeat customers dropped noticeably over the last month'"
                required
              />
            </Form.Group>
            <div className="d-flex flex-wrap gap-2 mb-1">
              {EXAMPLE_PROBLEMS.map((ex) => (
                <Button
                  key={ex}
                  size="sm"
                  variant="outline-secondary"
                  type="button"
                  onClick={() => setProblem(ex)}
                >
                  {ex}
                </Button>
              ))}
            </div>
          </Card.Body>
        </Card>

        <Card className="fmb-card mb-3">
          <Card.Body>
            <Card.Title className="h6 mb-3">3. Context</Card.Title>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>When did the problem start? *</Form.Label>
                  <Form.Control
                    value={problemDuration}
                    onChange={(e) => setProblemDuration(e.target.value)}
                    placeholder="e.g. About 3 weeks ago"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>How serious is it? *</Form.Label>
                  <Form.Select value={severity} onChange={(e) => setSeverity(e.target.value as Severity)}>
                    <option value="Low">Low — manageable for now</option>
                    <option value="Medium">Medium — needs attention soon</option>
                    <option value="High">High — actively hurting the business</option>
                    <option value="Critical">Critical — urgent</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>What changed recently?</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={recentChanges}
                onChange={(e) => setRecentChanges(e.target.value)}
                placeholder="New competitor, price change, staff change, season, anything — leave blank if nothing comes to mind"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>What have you already tried?</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={previousAttempts}
                onChange={(e) => setPreviousAttempts(e.target.value)}
                placeholder="Leave blank if you haven't tried anything yet"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>What result do you want?</Form.Label>
              <Form.Control
                value={desiredOutcome}
                onChange={(e) => setDesiredOutcome(e.target.value)}
                placeholder="e.g. Get back to our previous customer count within a month"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Current metrics (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={currentMetrics}
                onChange={(e) => setCurrentMetrics(e.target.value)}
                placeholder="Any numbers you track — e.g. 'foot traffic down from ~40/day to ~25/day'"
              />
            </Form.Group>
            <Form.Group className="mb-1">
              <Form.Label>Additional context (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Anything else worth knowing"
              />
            </Form.Group>
          </Card.Body>
        </Card>

        <Button type="submit" variant="primary" size="lg" disabled={submitting}>
          {submitting ? "Analyzing…" : "Get My Diagnosis"}
        </Button>
      </Form>
    </>
  );
}
