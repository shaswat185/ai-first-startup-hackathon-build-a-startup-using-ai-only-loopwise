import { Card, Badge } from "react-bootstrap";
import { MapPin } from "lucide-react";
import type { BusinessProfile } from "../types";
import { formatCurrency } from "../utils/format";

interface BusinessCardProps {
  business: BusinessProfile;
  selected?: boolean;
  onClick?: () => void;
}

export default function BusinessCard({ business, selected, onClick }: BusinessCardProps) {
  return (
    <Card
      role={onClick ? "button" : undefined}
      onClick={onClick}
      className={`fmb-card h-100 ${selected ? "border-primary" : ""}`}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="h6 mb-0">{business.name}</Card.Title>
          <Badge bg="light" text="dark" className="border">
            {business.category}
          </Badge>
        </div>
        <div className="fmb-muted small d-flex align-items-center gap-1 mb-2">
          <MapPin size={14} /> {business.location}
        </div>
        <Card.Text className="small fmb-muted mb-2" style={{ minHeight: 40 }}>
          {business.description}
        </Card.Text>
        <div className="small">
          <strong>Monthly budget:</strong> {formatCurrency(business.monthlyBudget)}
        </div>
      </Card.Body>
    </Card>
  );
}
