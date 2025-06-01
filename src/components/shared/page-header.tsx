import { ReactNode } from "react";
import AutoBreadcrumbs from "./Auto-breadcrumb";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  hideBreadcrumbs?: boolean;
}

export default function PageHeader({
  title,
  description,
  actions,
  className,
  hideBreadcrumbs = false,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {!hideBreadcrumbs && <AutoBreadcrumbs />}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}