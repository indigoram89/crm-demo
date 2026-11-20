import {useEffect, useState} from "react";

export type ThemeMode = "light" | "dark";
export type ThemeStyle = "default" | "glass" | "mouve" | "brutalism";
export type Theme = {style: ThemeStyle; mode: ThemeMode};

export const theme_styles: {id: ThemeStyle; label: string; description: string}[] = [
  {id: "default", label: "Стандарт", description: "Базовая тема HeroUI"},
  {id: "glass", label: "Glass", description: "Стекло: размытие и полупрозрачность"},
  {id: "mouve", label: "Mouve", description: "Тёплый лиловый, объёмные кнопки"},
  {id: "brutalism", label: "Brutalism", description: "Контраст, острые углы, моноширинный"},
];

const STORAGE_KEY = "theme-v2";

/** CSS тем HeroUI Pro грузится лениво и только для выбранной темы. */
const theme_css: Record<Exclude<ThemeStyle, "default">, () => Promise<{default: string}>> = {
  glass: () => import("@heroui-pro/react/themes/glass?inline"),
  mouve: () => import("@heroui-pro/react/themes/mouve?inline"),
  brutalism: () => import("@heroui-pro/react/themes/brutalism?inline"),
};

const loadThemeCss = (style: ThemeStyle) =>
  style === "default" ? Promise.resolve("") : theme_css[style]().then((module) => module.default);

/** Ставит CSS темы и атрибуты на <html> одновременно, чтобы не мелькала «половина» темы. */
function applyTheme(theme: Theme, css: string) {
  const style_id = "heroui-pro-theme";
  let element = document.getElementById(style_id) as HTMLStyleElement | null;

  if (css) {
    element ??= document.head.appendChild(Object.assign(document.createElement("style"), {id: style_id}));
    element.textContent = css;
  } else {
    element?.remove();
  }

  const value = theme.style === "default" ? theme.mode : `${theme.style}-${theme.mode}`;
  const root = document.documentElement;

  root.className = theme.style === "default" ? value : `${theme.mode} ${value}`;
  root.dataset.theme = value;
  root.style.colorScheme = theme.mode;
}

/** localStorage может быть недоступен (запрет данных сайтов, sandbox): тогда тема просто не запоминается. */
function readStored(): Partial<Theme> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<Theme>;
  } catch {
    return {};
  }
}

function getInitialTheme(): Theme {
  const stored = readStored();
  const style = theme_styles.some((entry) => entry.id === stored.style) ? stored.style! : "default";
  const mode =
    stored.mode === "light" || stored.mode === "dark"
      ? stored.mode
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

  return {style, mode};
}

/**
 * Тема HeroUI включается атрибутом на <html>: `light` / `dark` для базовой
 * и `glass-dark`, `mouve-light` и т. п. для Pro-тем (см. документацию Theming).
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    let is_current = true;

    loadThemeCss(theme.style)
      // Если CSS темы не загрузился (нет сети), остаёмся на базовой теме в выбранном режиме.
      .catch(() => "")
      .then((css) => {
        // При быстром переключении применяем только последнюю выбранную тему.
        if (is_current) applyTheme(css ? theme : {...theme, style: "default"}, css);
      });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    } catch {
      // Тема не запомнится между визитами — не страшно.
    }

    return () => {
      is_current = false;
    };
  }, [theme]);

  return [theme, setTheme] as const;
}
