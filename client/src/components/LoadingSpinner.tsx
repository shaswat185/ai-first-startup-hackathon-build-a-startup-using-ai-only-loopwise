import { Spinner } from "react-bootstrap";

export default function LoadingSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="d-flex align-items-center justify-content-center gap-2 py-5 fmb-muted">
      <Spinner animation="border" size="sm" role="status" />
      <span>{label}</span>
    </div>
  );
}
