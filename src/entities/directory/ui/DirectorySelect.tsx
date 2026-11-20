import type {Key} from "@heroui/react";

import {Description, Label, ListBox, Select} from "@heroui/react";

import {getSelectableItems} from "../model/store";
import type {Directory} from "../model/types";

type Props = {
  directory: Directory;
  value: string | null;
  onChange: (value: string | null) => void;
  description?: string;
  isRequired?: boolean;
  variant?: "primary" | "secondary";
};

/** Поле выбора значения справочника: порядок и скрытые значения берутся из настроек. */
export function DirectorySelect({directory, value, onChange, description, isRequired, variant}: Props) {
  const items = getSelectableItems(directory, value);

  return (
    <Select
      fullWidth
      isRequired={isRequired}
      placeholder="Не выбрано"
      value={value}
      variant={variant}
      onChange={(key: Key | Key[] | null) => onChange(key === null ? null : String(key))}
    >
      <Label>{directory.field_label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      {description && <Description>{description}</Description>}
      <Select.Popover>
        <ListBox>
          {items.map((item) => (
            <ListBox.Item key={item.id} id={item.id} textValue={item.name}>
              {item.name}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
