import { Card, ProgressBar } from "react-bootstrap";

interface ProgressCardProps {
  progressPercent: number;
  completedCount: number;
  totalCount: number;
}

export default function ProgressCard({ progressPercent, completedCount, totalCount }: ProgressCardProps) {
  return (
    <Card className="fmb-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title className="h6 mb-0">Weekly Progress</Card.Title>
          <span className="fw-medium">{progressPercent}%</span>
        </div>
        <ProgressBar now={progressPercent} variant={progressPercent === 100 ? "success" : "primary"} />
        <div className="fmb-muted small mt-2">
          {completedCount} of {totalCount} tasks completed
        </div>
      </Card.Body>
    </Card>
  );
}
