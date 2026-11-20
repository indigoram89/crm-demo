import type {Key} from "@heroui/react";

import {Plus} from "@gravity-ui/icons";
import {Autocomplete, Description, EmptyState, Label, ListBox, SearchField, toast, useFilter} from "@heroui/react";
import {useState} from "react";

import {type Directory, addDirectoryItem, getSelectableItems} from "@/entities/directory";

const CREATE_KEY = "__create__";
const HIDDEN_KEY = "__hidden__";
const MAX_LENGTH = 60;

type Props = {
  directory: Directory;
  value: string | null;
  onChange: (value: string | null) => void;
  variant?: "primary" | "secondary";
};

/**
 * Выбор значения справочника с поиском. Если нужного нет — менеджер дописывает его сам,
 * без обращения к админу: значение сразу попадает в справочник и выбирается.
 */
export function CreatableDirectorySelect({directory, value, onChange, variant}: Props) {
  const {contains} = useFilter({sensitivity: "base"});
  const [input_value, setInputValue] = useState("");

  const items = getSelectableItems(directory, value);
  const query = input_value.trim().slice(0, MAX_LENGTH);
  const exact_match = directory.items.find((item) => item.name.toLocaleLowerCase() === query.toLocaleLowerCase());
  // Значение есть, но скрыто в настройках: не плодим дубликат, а объясняем, почему его нет в списке.
  const hidden_match = exact_match && !items.includes(exact_match) ? exact_match : null;

  const handleChange = (key: Key | Key[] | null) => {
    if (key !== CREATE_KEY) {
      onChange(key === null ? null : String(key));

      return;
    }

    const created = addDirectoryItem(directory.id, query);

    onChange(created.id);
    setInputValue("");
    toast.success(`«${created.name}» добавлено`, {
      description: `Справочник «${directory.title}» пополнен`,
    });
  };

  return (
    <Autocomplete
      allowsEmptyCollection
      fullWidth
      placeholder="Не выбрано"
      selectionMode="single"
      value={value}
      variant={variant}
      onChange={handleChange}
    >
      <Label>{directory.field_label}</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value />
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Description>Нет нужного — впишите и добавьте</Description>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains} inputValue={input_value} onInputChange={setInputValue}>
          <SearchField autoFocus aria-label={`Найти: ${directory.field_label}`} name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input maxLength={MAX_LENGTH} placeholder="Найти или добавить" />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox
            className="max-h-72 overflow-y-auto"
            renderEmptyState={() => <EmptyState>Начните вводить, чтобы добавить</EmptyState>}
          >
            {items.map((item) => (
              <ListBox.Item key={item.id} id={item.id} textValue={item.name}>
                {item.name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
            {hidden_match && (
              <ListBox.Item isDisabled id={HIDDEN_KEY} textValue={query}>
                <span className="text-muted">«{hidden_match.name}» скрыто администратором в настройках</span>
              </ListBox.Item>
            )}
            {query && !exact_match && (
              <ListBox.Item id={CREATE_KEY} textValue={query}>
                <Plus className="size-4 text-accent" />
                <span>
                  Добавить <span className="font-medium">«{query}»</span>
                </span>
              </ListBox.Item>
            )}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}
