import type {ReactNode} from "react";

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({title, description, actions}: Props) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {actions}
    </header>
  );
}
