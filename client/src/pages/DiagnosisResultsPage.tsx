import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, Badge, Button, ListGroup, Row, Col } from "react-bootstrap";
import { ClipboardList, AlertOctagon, Info } from "lucide-react";
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
import { formatDate } from "../utils/format";

export default function DiagnosisResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followUpSubmitting, setFollowUpSubmitting] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);

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

  return (
    <>
      <PageHeader
        title="Diagnosis Results"
        subtitle={`Created ${formatDate(diagnosis.createdAt)} · ${diagnosis.businessName}`}
        action={
          <Button variant="primary" onClick={() => navigate(`/action-plan/${diagnosis.id}`)}>
            <ClipboardList size={16} className="me-1" /> View 7-Day Action Plan
          </Button>
        }
      />

      <Row className="g-3">
        <Col lg={8}>
          <div className="d-flex flex-column gap-3">
            <DiagnosisSummary
              businessName={diagnosis.businessName}
              problem={diagnosis.problem}
              summary={diagnosis.summary}
              confidence={diagnosis.confidence as string | undefined}
            />

            <CauseList causes={diagnosis.possibleCauses} />

            <RecommendationList recommendations={diagnosis.recommendations} />

            {followUpError && <ErrorAlert message={followUpError} />}
            <FollowUpQuestionForm
              questions={diagnosis.followUpQuestions}
              onSubmit={handleFollowUpSubmit}
              submitting={followUpSubmitting}
            />
          </div>
        </Col>

        <Col lg={4}>
          <div className="d-flex flex-column gap-3">
            {diagnosis.assumptions.length > 0 && (
              <Card className="fmb-card">
                <Card.Body>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Info size={16} className="text-primary" />
                    <Card.Title className="h6 mb-0">Assumptions</Card.Title>
                  </div>
                  <ListGroup variant="flush">
                    {diagnosis.assumptions.map((a, idx) => (
                      <ListGroup.Item key={idx} className="px-0 small">
                        {a}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            )}

            {diagnosis.dataLimitations.length > 0 && (
              <Card className="fmb-card">
                <Card.Body>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <AlertOctagon size={16} className="text-warning" />
                    <Card.Title className="h6 mb-0">Missing Data</Card.Title>
                  </div>
                  <ListGroup variant="flush">
                    {diagnosis.dataLimitations.map((d, idx) => (
                      <ListGroup.Item key={idx} className="px-0 small">
                        {d}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            )}

            {diagnosis.risks.length > 0 && (
              <Card className="fmb-card">
                <Card.Body>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <AlertOctagon size={16} className="text-danger" />
                    <Card.Title className="h6 mb-0">Risks</Card.Title>
                  </div>
                  <ListGroup variant="flush">
                    {diagnosis.risks.map((r, idx) => (
                      <ListGroup.Item key={idx} className="px-0 small">
                        {r}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            )}

            <Card className="fmb-card">
              <Card.Body>
                <Card.Title className="h6 mb-2">Status</Card.Title>
                <Badge bg="light" text="dark" className="border">
                  {diagnosis.status}
                </Badge>
                <div className="mt-3">
                  <Link to="/history" className="small">
                    View diagnosis history
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </>
  );
}
