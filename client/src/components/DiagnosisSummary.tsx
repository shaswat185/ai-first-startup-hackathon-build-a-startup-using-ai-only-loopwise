import { Card, Badge } from "react-bootstrap";
import { Stethoscope } from "lucide-react";
import type { BootstrapVariant } from "../utils/format";

interface DiagnosisSummaryProps {
  businessName: string;
  problem: string;
  summary: string;
  confidence?: string;
}

const confidenceVariant: Record<string, BootstrapVariant> = {
  Low: "secondary",
  Medium: "warning",
  High: "success",
};

export default function DiagnosisSummary({ businessName, problem, summary, confidence }: DiagnosisSummaryProps) {
  return (
    <Card className="fmb-card">
      <Card.Body>
        <div className="d-flex align-items-center gap-2 mb-2">
          <div className="fmb-feature-icon">
            <Stethoscope size={20} />
          </div>
          <div>
            <div className="fmb-muted small">{businessName}</div>
            <Card.Title className="h5 mb-0">Diagnosis</Card.Title>
          </div>
          {confidence && (
            <Badge bg={confidenceVariant[confidence] || "secondary"} className="ms-auto">
              {confidence} confidence
            </Badge>
          )}
        </div>
        <p className="fmb-muted small mb-2">
          <strong>Reported problem:</strong> {problem}
        </p>
        <Card.Text>{summary}</Card.Text>
      </Card.Body>
    </Card>
  );
}
