import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function PageHeader({ title, actions = null }: PageHeaderProps) {
  return (
    <div className="flex justify-between">
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      <div className="flex">{actions}</div>
    </div>
  );
}
