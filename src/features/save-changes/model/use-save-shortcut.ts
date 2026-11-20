import {useEffect, useRef} from "react";

/**
 * ⌘S / Ctrl+S вызывает сохранение вместо сохранения страницы браузером.
 * Сравниваем физическую клавишу (event.code): в русской раскладке event.key равен «ы».
 */
export function useSaveShortcut(onSave: () => void, is_enabled: boolean) {
  const on_save_ref = useRef(onSave);

  on_save_ref.current = onSave;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.code === "KeyS") {
        event.preventDefault();
        if (is_enabled) on_save_ref.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [is_enabled]);
}
