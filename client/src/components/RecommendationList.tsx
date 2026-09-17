import { Card, Badge } from "react-bootstrap";
import { Lightbulb } from "lucide-react";
import type { Recommendation } from "../types";
import { formatCurrency, priorityVariant } from "../utils/format";

export default function RecommendationList({ recommendations }: { recommendations: Recommendation[] }) {
  if (recommendations.length === 0) return null;

  return (
    <Card className="fmb-card">
      <Card.Body>
        <Card.Title className="h6 mb-3">Recommendations</Card.Title>
        <div className="d-flex flex-column gap-3">
          {recommendations.map((r, idx) => (
            <div key={idx} className="border-bottom pb-3 last-child-no-border">
              <div className="d-flex justify-content-between align-items-start gap-2">
                <div className="d-flex gap-2">
                  <Lightbulb size={18} className="text-primary flex-shrink-0 mt-1" />
                  <div className="fw-medium">{r.title}</div>
                </div>
                <Badge bg={priorityVariant(r.priority)}>{r.priority}</Badge>
              </div>
              <p className="small mb-1 mt-1">{r.description}</p>
              <p className="small fmb-muted mb-1">
                <strong>Why it fits:</strong> {r.whyItFits}
              </p>
              <p className="small mb-0">
                <strong>Estimated cost:</strong> {formatCurrency(r.estimatedCost)}
              </p>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}
