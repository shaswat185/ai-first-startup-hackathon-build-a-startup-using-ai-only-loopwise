import { Alert, Button } from "react-bootstrap";
import { AlertTriangle } from "lucide-react";

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <Alert variant="danger" className="d-flex align-items-start gap-2">
      <AlertTriangle size={18} className="mt-1 flex-shrink-0" />
      <div className="flex-grow-1">
        <div>{message}</div>
        {onRetry && (
          <Button size="sm" variant="outline-danger" className="mt-2" onClick={onRetry}>
            Try Again
          </Button>
        )}
      </div>
    </Alert>
  );
}
