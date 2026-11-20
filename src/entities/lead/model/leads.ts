import {createStore} from "@/shared/lib/create-store";

export type UtmField = "utm_source" | "utm_medium" | "utm_campaign" | "referrer" | "landing";

export type LeadStage = "new" | "repeat" | "accepted" | "unqualified" | "qualified";

export type LeadNeed = {id: string; product_id: string; quantity: number; unit_id: string};

export type LeadTask = {id: string; title: string; due_at: string; is_done: boolean; author: string};

export type Lead = {
  id: number;
  created_at: string;
  stage: LeadStage;
  manager: string;
  /** Ответственный сотрудник. null — не назначен. */
  assignee_id: string | null;
  client: {name: string; phone: string; leads_count: number; open_count: number};
  object: {type_id: string; title: string; address: string} | null;
  channel_id: string | null;
  source_id: string | null;
  amount: number;
  needs: LeadNeed[];
  note: string;
  tasks: LeadTask[];
  missed_calls: number;
  unread_messages: number;
  last_message: string;
  utm: Partial<Record<UtmField, string>>;
};

export const utm_field_labels: Record<UtmField, string> = {
  utm_source: "utm_source",
  utm_medium: "utm_medium",
  utm_campaign: "utm_campaign",
  referrer: "Реферер",
  landing: "Посадочная страница",
};

export const stages: {id: LeadStage; label: string; color: "default" | "accent" | "success" | "warning" | "danger"}[] =
  [
    {id: "new", label: "Входящий звонок", color: "accent"},
    {id: "repeat", label: "Повторное обращение", color: "default"},
    {id: "accepted", label: "Принят менеджером", color: "warning"},
    {id: "unqualified", label: "Не качественная", color: "danger"},
    {id: "qualified", label: "Качественная", color: "success"},
  ];

const lead = (
  id: number,
  client_name: string,
  stage: LeadStage,
  utm: Lead["utm"],
  extra: Partial<Lead> = {},
): Lead => ({
  id,
  created_at: "2026-11-18T09:38:00",
  stage,
  manager: "Ким Виктория",
  assignee_id: id % 3 === 0 ? null : String((id % 4) + 1),
  client: {name: client_name, phone: "+7 (701) 415-70-15", leads_count: 1, open_count: 1},
  object: null,
  channel_id: "call",
  source_id: null,
  amount: 0,
  needs: [],
  note: "",
  tasks: [],
  missed_calls: 0,
  unread_messages: 0,
  last_message: "",
  utm,
  ...extra,
});

const initial: Lead[] = [
  lead(
    441,
    "Смирнова Елена",
    "new",
    {utm_source: "google", utm_campaign: "okna_almaty_brand"},
    {
      client: {name: "Смирнова Елена", phone: "+7 (701) 415-70-15", leads_count: 3, open_count: 2},
      object: {type_id: "flat", title: "Кв. на Сатпаева", address: "Алматы, ул. Сатпаева, кв. 6"},
      amount: 1_784_000,
      needs: [
        {id: "n1", product_id: "rehau70", quantity: 4, unit_id: "pcs"},
        {id: "n2", product_id: "mosquito", quantity: 4, unit_id: "pcs"},
        {id: "n3", product_id: "sill", quantity: 6.5, unit_id: "m"},
      ],
      tasks: [
        {
          id: "t1",
          title: "Напомнить об оплате предоплаты",
          due_at: "2026-11-21T10:30:00",
          is_done: false,
          author: "Ким Виктория",
        },
        {
          id: "t2",
          title: "Согласовать дату замера",
          due_at: "2026-11-19T15:00:00",
          is_done: true,
          author: "Ким Виктория",
        },
      ],
      missed_calls: 1,
      unread_messages: 2,
      last_message: "Здравствуйте, а замер можно на этой неделе?",
    },
  ),
  lead(440, "Ахметов Руслан", "accepted", {utm_source: "google", utm_medium: "cpc"}),
  lead(439, "Петрова Ирина", "qualified", {utm_source: "google"}, {amount: 920_000}),
  lead(438, "Ли Сергей", "repeat", {referrer: "https://www.instagram.com/okna"}),
  lead(437, "Нурланова Айгерим", "new", {landing: "/2gis-skidka"}),
  lead(436, "Ким Денис", "accepted", {utm_source: "google", utm_campaign: "okna_almaty_brand"}),
  lead(435, "Орлова Мария", "unqualified", {utm_source: "facebook"}),
  lead(434, "Беков Арман", "new", {utm_source: "tiktok", utm_campaign: "autumn"}),
  lead(433, "Сидоров Павел", "qualified", {utm_source: "2gis"}, {source_id: "2gis", amount: 450_000}),
  lead(432, "Жумабаева Дана", "accepted", {referrer: "https://l.instagram.com/"}),
  lead(431, "Иванов Олег", "new", {utm_source: "google"}),
  lead(430, "Тен Алина", "repeat", {utm_source: "vk"}),
  lead(
    429,
    "Мусин Ержан",
    "qualified",
    {utm_source: "yandex", utm_medium: "cpc"},
    {source_id: "yandex", amount: 1_210_000},
  ),
];

const store = createStore(initial);

export const useLeads = store.useStore;

export function updateLead(id: number, patch: Partial<Lead>) {
  store.set((prev) => prev.map((item) => (item.id === id ? {...item, ...patch} : item)));
}

/** Проставляет источник сразу нескольким заявкам. Заявки с уже указанным источником не трогает. */
export function assignSources(assignments: Map<number, string>) {
  store.set((prev) =>
    prev.map((item) => {
      const source_id = assignments.get(item.id);

      return source_id && !item.source_id ? {...item, source_id} : item;
    }),
  );
}
