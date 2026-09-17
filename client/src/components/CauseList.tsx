import { Card, ListGroup } from "react-bootstrap";
import { HelpCircle } from "lucide-react";
import type { PossibleCause } from "../types";

export default function CauseList({ causes }: { causes: PossibleCause[] }) {
  if (causes.length === 0) return null;

  return (
    <Card className="fmb-card">
      <Card.Body>
        <Card.Title className="h6 mb-3">Possible Causes</Card.Title>
        <p className="fmb-muted small">
          These are hypotheses based on what you've shared, not confirmed facts.
        </p>
        <ListGroup variant="flush">
          {causes.map((c, idx) => (
            <ListGroup.Item key={idx} className="px-0">
              <div className="d-flex gap-2">
                <HelpCircle size={18} className="text-primary flex-shrink-0 mt-1" />
                <div>
                  <div className="fw-medium">{c.cause}</div>
                  <div className="small fmb-muted">{c.reason}</div>
                  <div className="small mt-1">
                    <strong>To confirm:</strong> {c.evidenceNeeded}
                  </div>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}
