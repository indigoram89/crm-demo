import type {ReactNode} from "react";

type Props = {
  icon: ReactNode;
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
};

/** Блок формы заявки: иконка, заголовок, необязательное пояснение справа. */
export function Section({icon, title, description, aside, children}: Props) {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-secondary text-muted">
          {icon}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && <p className="text-xs text-muted">{description}</p>}
        </div>
        {aside && <span className="text-xs text-muted">{aside}</span>}
      </header>
      {children}
    </section>
  );
}
