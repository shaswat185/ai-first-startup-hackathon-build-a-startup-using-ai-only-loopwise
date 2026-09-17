import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
      <div>
        <h1 className="h3 mb-1">{title}</h1>
        {subtitle && <p className="fmb-muted mb-0">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
