import type { ReactNode } from "react";
import { Card } from "react-bootstrap";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  hint?: string;
}

export default function StatCard({ label, value, icon, hint }: StatCardProps) {
  return (
    <Card className="fmb-card h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="fmb-muted small">{label}</div>
            <div className="h3 mb-0 mt-1">{value}</div>
            {hint && <div className="fmb-muted small mt-1">{hint}</div>}
          </div>
          {icon && <div className="fmb-feature-icon">{icon}</div>}
        </div>
      </Card.Body>
    </Card>
  );
}
