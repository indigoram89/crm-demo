import {useCallback, useSyncExternalStore} from "react";

import {hasUnsavedChanges, warnUnsavedChanges} from "./unsaved-changes";

const readHash = () => window.location.hash.replace(/^#/, "") || "/";

let current_path = readHash();

const subscribe = (callback: () => void) => {
  const handleHashChange = () => {
    const next = readHash();

    if (next === current_path) return;

    // «Назад» в браузере при несохранённых правках: возвращаем адрес и предупреждаем.
    if (hasUnsavedChanges()) {
      window.history.pushState(null, "", `#${current_path}`);
      warnUnsavedChanges();

      return;
    }

    current_path = next;
    callback();
  };

  window.addEventListener("hashchange", handleHashChange);

  return () => window.removeEventListener("hashchange", handleHashChange);
};

const getPath = () => current_path;

/** Простой роутер на hash: без зависимостей и без настройки сервера (подходит для GitHub Pages). */
export function useHashRoute(): [string, (href: string) => void] {
  const path = useSyncExternalStore(subscribe, getPath);

  const navigate = useCallback((href: string) => {
    if (hasUnsavedChanges()) {
      warnUnsavedChanges();

      return;
    }

    window.location.hash = href.replace(/^#/, "");
  }, []);

  return [path, navigate];
}
