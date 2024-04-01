import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
  description?: string | null;
}

export function PageHeader({ title, description = null, actions = null }: PageHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <div className="flex">{actions}</div>
      </div>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}
