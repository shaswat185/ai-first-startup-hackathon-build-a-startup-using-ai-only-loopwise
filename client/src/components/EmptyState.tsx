import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="text-center py-5">
      <div className="mb-3 text-secondary">{icon ?? <Inbox size={36} />}</div>
      <h3 className="h5">{title}</h3>
      {message && <p className="fmb-muted mx-auto" style={{ maxWidth: 420 }}>{message}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
