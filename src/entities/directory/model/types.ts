export type DirectoryId = "channels" | "sources" | "object_types" | "positions" | "units";

export type DirectoryItem = {
  id: string;
  name: string;
  is_hidden: boolean;
  /** Сколько записей уже ссылаются на значение. Такое значение нельзя удалить. */
  used_count: number;
};

export type Directory = {
  id: DirectoryId;
  title: string;
  description: string;
  /** Подпись поля в формах, где выбирают значение. */
  field_label: string;
  items: DirectoryItem[];
  default_id: string | null;
};
