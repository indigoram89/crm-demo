import {Toast} from "@heroui/react";
import {I18nProvider} from "react-aria-components";

import {useLeads} from "@/entities/lead";
import {CallsPage} from "@/pages/calls";
import {LeadsPage} from "@/pages/leads";
import {type SettingsSection, SettingsPage, settings_sections} from "@/pages/settings";
import {useHashRoute} from "@/shared/lib/use-hash-route";
import {useTheme} from "@/shared/lib/theme";
import {AppShell} from "@/widgets/app-shell";

type Route =
  | {page: "calls"; breadcrumbs: string[]}
  | {page: "leads"; lead_id: number | null; breadcrumbs: string[]}
  | {page: "settings"; section: SettingsSection; breadcrumbs: string[]};

const section_titles: Record<SettingsSection, string> = {
  channels: "Каналы обращения",
  sources: "Источники трафика",
  object_types: "Типы объекта",
  positions: "Должности",
  units: "Единицы измерения",
  utm: "UTM-метки",
};

/** Разбор адреса. Неизвестные адреса ведут на список заявок. */
function parseRoute(path: string): Route {
  const [, page, param] = path.split("/");

  if (page === "settings") {
    const section = settings_sections.find((entry) => entry === param) ?? "channels";

    return {page: "settings", section, breadcrumbs: ["Настройки", section_titles[section]]};
  }

  if (page === "calls") return {page: "calls", breadcrumbs: ["Звонки"]};

  const lead_id = Number(param);

  return {page: "leads", lead_id: Number.isInteger(lead_id) && lead_id > 0 ? lead_id : null, breadcrumbs: ["Заявки"]};
}

export function App() {
  const [path, navigate] = useHashRoute();
  const [theme, setTheme] = useTheme();
  const route = parseRoute(path);
  const leads = useLeads();
  const attention_count = leads.filter((lead) => lead.missed_calls > 0 || lead.unread_messages > 0).length;

  return (
    <I18nProvider locale="ru-RU">
      <AppShell
        breadcrumbs={route.breadcrumbs}
        counters={{"/leads": attention_count}}
        navigate={navigate}
        path={`/${route.page}`}
        theme={theme}
        onThemeChange={setTheme}
      >
        {route.page === "settings" ? (
          <SettingsPage navigate={navigate} section={route.section} />
        ) : route.page === "calls" ? (
          <CallsPage />
        ) : (
          <LeadsPage lead_id={route.lead_id} navigate={navigate} />
        )}
      </AppShell>
      <Toast.Provider />
    </I18nProvider>
  );
}
