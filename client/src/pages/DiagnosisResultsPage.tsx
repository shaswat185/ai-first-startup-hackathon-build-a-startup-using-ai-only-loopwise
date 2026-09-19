import { useEffect, useState, type ReactNode } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Badge, Button, Nav, Row, Col } from "react-bootstrap";
import { ClipboardList, Info, AlertOctagon, ShieldAlert } from "lucide-react";
import PageHeader from "../components/PageHeader";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";
import DiagnosisSummary from "../components/DiagnosisSummary";
import CauseList from "../components/CauseList";
import RecommendationList from "../components/RecommendationList";
import FollowUpQuestionForm from "../components/FollowUpQuestionForm";
import { diagnosisApi } from "../services/diagnosisApi";
import { getApiErrorMessage } from "../services/apiClient";
import type { Diagnosis } from "../types";
import { formatDate, statusLabel } from "../utils/format";

type TabKey = "overview" | "recommendations" | "context";

export default function DiagnosisResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followUpSubmitting, setFollowUpSubmitting] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    diagnosisApi
      .get(id)
      .then(setDiagnosis)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleFollowUpSubmit(answers: { question: string; answer: string }[]) {
    if (!id) return;
    setFollowUpError(null);
    setFollowUpSubmitting(true);
    try {
      const updated = await diagnosisApi.submitFollowUp(id, answers);
      setDiagnosis(updated);
    } catch (err) {
      setFollowUpError(getApiErrorMessage(err));
    } finally {
      setFollowUpSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading diagnosis…" />;
  if (error) return <ErrorAlert message={error} onRetry={load} />;
  if (!diagnosis) return null;

  const contextCount = diagnosis.assumptions.length + diagnosis.dataLimitations.length + diagnosis.risks.length;

  return (
    <>
      <PageHeader
        title="Diagnosis Results"
        subtitle={`${diagnosis.businessName} · Created ${formatDate(diagnosis.createdAt)}`}
        action={
          <Button variant="primary" onClick={() => navigate(`/action-plan/${diagnosis.id}`)}>
            <ClipboardList size={16} className="me-1" /> View 7-Day Action Plan
          </Button>
        }
      />

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <Nav variant="tabs" className="fmb-tabs flex-grow-1" activeKey={activeTab} onSelect={(k) => setActiveTab((k as TabKey) || "overview")}>
          <Nav.Item>
            <Nav.Link eventKey="overview">Diagnosis</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="recommendations">
              Recommendations
              <Badge bg="light" className="ms-2">{diagnosis.recommendations.length}</Badge>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="context">
              Assumptions &amp; Risks
              {contextCount > 0 && <Badge bg="light" className="ms-2">{contextCount}</Badge>}
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <Badge bg="light" text="dark" className="border">
          {statusLabel(diagnosis.status)}
        </Badge>
      </div>

      {activeTab === "overview" && (
        <Row className="g-3">
          <Col lg={8}>
            <div className="d-flex flex-column gap-3">
              <DiagnosisSummary
                businessName={diagnosis.businessName}
                problem={diagnosis.problem}
                summary={diagnosis.summary}
                confidence={diagnosis.confidence}
              />
              <CauseList causes={diagnosis.possibleCauses} />
            </div>
          </Col>
          <Col lg={4}>
            {followUpError && <ErrorAlert message={followUpError} />}
            <FollowUpQuestionForm
              questions={diagnosis.followUpQuestions}
              onSubmit={handleFollowUpSubmit}
              submitting={followUpSubmitting}
            />
          </Col>
        </Row>
      )}

      {activeTab === "recommendations" && (
        <Row className="g-3">
          <Col lg={12}>
            <RecommendationList recommendations={diagnosis.recommendations} />
          </Col>
        </Row>
      )}

      {activeTab === "context" && (
        <Row className="g-3">
          {diagnosis.assumptions.length > 0 && (
            <Col md={4}>
              <ContextList
                icon={<Info size={16} className="text-primary" />}
                title="Assumptions"
                items={diagnosis.assumptions}
              />
            </Col>
          )}
          {diagnosis.dataLimitations.length > 0 && (
            <Col md={4}>
              <ContextList
                icon={<AlertOctagon size={16} style={{ color: "var(--fmb-warning)" }} />}
                title="Missing Data"
                items={diagnosis.dataLimitations}
              />
            </Col>
          )}
          {diagnosis.risks.length > 0 && (
            <Col md={4}>
              <ContextList
                icon={<ShieldAlert size={16} style={{ color: "var(--fmb-danger)" }} />}
                title="Risks"
                items={diagnosis.risks}
              />
            </Col>
          )}
          {contextCount === 0 && (
            <Col>
              <p className="fmb-muted">No assumptions, missing data, or risks were flagged for this diagnosis.</p>
            </Col>
          )}
        </Row>
      )}

      <div className="mt-4">
        <Link to="/history" className="small">
          View diagnosis history
        </Link>
      </div>
    </>
  );
}

function ContextList({ icon, title, items }: { icon: ReactNode; title: string; items: string[] }) {
  return (
    <div className="fmb-card h-100 p-3">
      <div className="d-flex align-items-center gap-2 mb-2">
        {icon}
        <h3 className="h6 mb-0">{title}</h3>
      </div>
      <ul className="ps-3 mb-0 small">
        {items.map((item, idx) => (
          <li key={idx} className="mb-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
