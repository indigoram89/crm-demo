import type {ReactNode} from "react";

/**
 * Поля ввода внутри строк ListView (RAC GridList): строка перехватывает пробел, стрелки
 * и набор букв для навигации. Обёртка оставляет клавиши полю. Tab, Escape и сочетания с ⌘/Ctrl
 * (например, ⌘S) работают как обычно.
 */
export function KeyboardIsolation({children, className}: {children: ReactNode; className?: string}) {
  return (
    <div
      className={className}
      onKeyDown={(event) => {
        if (event.key === "Tab" || event.key === "Escape" || event.metaKey || event.ctrlKey) return;

        event.stopPropagation();
      }}
    >
      {children}
    </div>
  );
}
