import {createStore} from "@/shared/lib/create-store";
import {createId} from "@/shared/lib/format";

import type {Directory, DirectoryId, DirectoryItem} from "./types";

const item = (id: string, name: string, used_count = 0, is_hidden = false): DirectoryItem => ({
  id,
  name,
  is_hidden,
  used_count,
});

const initial: Record<DirectoryId, Directory> = {
  channels: {
    id: "channels",
    title: "Каналы обращения",
    description: "Как клиенты обращаются к нам: звонок, сайт, мессенджеры",
    field_label: "Канал обращения",
    default_id: "call",
    items: [
      item("site", "Форма с сайта", 41),
      item("call", "Звонок", 128),
      item("whatsapp", "WhatsApp", 64),
      item("telegram", "Telegram", 12),
      item("meta", "Meta", 3, true),
      item("office", "Пришёл в офис"),
    ],
  },
  sources: {
    id: "sources",
    title: "Источники трафика",
    description: "Откуда пришёл клиент. Подставляется по UTM-меткам автоматически",
    field_label: "Источник трафика",
    default_id: null,
    items: [
      item("google", "Google", 52),
      item("yandex", "Яндекс", 31),
      item("2gis", "2ГИС", 18),
      item("instagram", "Instagram", 27),
      item("referral", "Рекомендация", 9),
    ],
  },
  object_types: {
    id: "object_types",
    title: "Типы объекта",
    description: "Где будет установка: квартира, дом, офис",
    field_label: "Тип объекта",
    default_id: "flat",
    items: [
      item("flat", "Квартира", 96),
      item("house", "Частный дом", 40),
      item("office", "Офис", 11),
      item("cottage", "Коттедж", 7),
      item("dacha", "Дача"),
    ],
  },
  positions: {
    id: "positions",
    title: "Должности",
    description: "Должности сотрудников для назначения и группировки",
    field_label: "Должность",
    default_id: null,
    items: [
      item("director", "Директор", 1),
      item("head_sales", "Руководитель отдела продаж", 1),
      item("manager", "Менеджер", 6),
      item("measurer", "Замерщик", 3),
      item("installer", "Монтажник", 8),
      item("accountant", "Бухгалтер", 2),
      item("lawyer", "Юрист", 1),
      item("logist", "Логист"),
    ],
  },
  units: {
    id: "units",
    title: "Единицы измерения",
    description: "В чём считаем продукцию в расчётах",
    field_label: "Единица",
    default_id: "pcs",
    items: [item("pcs", "шт", 210), item("m", "п.м.", 54), item("m2", "м²", 17), item("set", "компл.")],
  },
};

const store = createStore(initial);

export const useDirectories = store.useStore;

export const useDirectory = (id: DirectoryId) => store.useStore()[id];

export function saveDirectory(directory: Directory) {
  store.set((prev) => ({...prev, [directory.id]: directory}));
}

/** Менеджер дописывает значение прямо из формы. Админ увидит его в настройках. */
export function addDirectoryItem(id: DirectoryId, name: string): DirectoryItem {
  const created = item(createId(), name.trim());

  store.set((prev) => ({...prev, [id]: {...prev[id], items: [...prev[id].items, created]}}));

  return created;
}

/** Значения, которые предлагаются в форме: видимые, плюс уже выбранное, даже если его скрыли. */
export function getSelectableItems(directory: Directory, selected_id: string | null) {
  return directory.items.filter((entry) => !entry.is_hidden || entry.id === selected_id);
}
