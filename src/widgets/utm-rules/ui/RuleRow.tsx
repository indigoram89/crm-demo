import type {Key} from "@heroui/react";

import {CircleInfo, Grip, TrashBin} from "@gravity-ui/icons";
import {Input, ListBox, Select, Switch} from "@heroui/react";

import type {Directory} from "@/entities/directory";
import {type UtmField, utm_field_labels} from "@/entities/lead";
import {plural} from "@/shared/lib/plural";
import {IconAction} from "@/shared/ui/IconAction";
import {KeyboardIsolation} from "@/shared/ui/KeyboardIsolation";

import {type Condition, type UtmRule, condition_labels} from "@/entities/utm-rule";

type Props = {
  rule: UtmRule;
  index: number;
  sources: Directory;
  matched_count: number;
  onChange: (patch: Partial<UtmRule>) => void;
  onRemove: () => void;
};

function InlineSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: T | null;
  options: {id: T; name: string}[];
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <Select
      aria-label={label}
      className={className}
      placeholder="Выберите"
      value={value}
      variant="secondary"
      onChange={(key: Key | Key[] | null) => key !== null && onChange(key as T)}
    >
      <Select.Trigger>
        <Select.Value className="truncate" />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map((option) => (
            <ListBox.Item key={option.id} id={option.id} textValue={option.name}>
              {option.name}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

/**
 * Сетка строки правила. На телефоне — две строки: «поле, условие» и «значение, источник, вкл.».
 * На широком экране — одна строка, совпадает с шапкой таблицы.
 */
export const rule_grid =
  "w-full grid-cols-[2rem_1.5rem_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 lg:grid-cols-[2rem_1.5rem_minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1.3fr)_minmax(0,1fr)_5.5rem]";

const field_options = (Object.keys(utm_field_labels) as UtmField[]).map((id) => ({id, name: utm_field_labels[id]}));
const condition_options = (Object.keys(condition_labels) as Condition[]).map((id) => ({
  id,
  name: condition_labels[id],
}));

/** Одна строка правила: «если поле … условие … значение — ставим источник …». */
export function RuleRow({rule, index, sources, matched_count, onChange, onRemove}: Props) {
  const source_options = sources.items.filter((item) => !item.is_hidden || item.id === rule.source_id);

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className={`grid ${rule_grid}`}>
        <IconAction label="Перетащите, чтобы изменить порядок" slot="drag">
          <Grip className="size-4 text-muted" />
        </IconAction>
        <span className="text-center text-sm text-muted tabular-nums">{index + 1}</span>
        <InlineSelect label="Поле" options={field_options} value={rule.field} onChange={(field) => onChange({field})} />
        <InlineSelect
          label="Условие"
          options={condition_options}
          value={rule.condition}
          onChange={(condition) => onChange({condition})}
        />
        <KeyboardIsolation className="col-span-2 col-start-3 lg:col-span-1 lg:col-start-auto">
          <Input
            fullWidth
            aria-label="Значение"
            className="font-mono text-sm"
            maxLength={200}
            placeholder="Значение метки"
            value={rule.value}
            variant="secondary"
            onChange={(event) => onChange({value: event.target.value})}
          />
        </KeyboardIsolation>
        <InlineSelect
          className="col-start-3 lg:col-start-auto"
          label="Источник трафика"
          options={source_options}
          value={rule.source_id}
          onChange={(source_id) => onChange({source_id})}
        />
        <div className="flex items-center justify-end gap-1">
          <Switch
            aria-label="Правило включено"
            isSelected={rule.is_enabled}
            onChange={(is_enabled) => onChange({is_enabled})}
          >
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Content>
          </Switch>
          <IconAction label="Удалить правило" onPress={onRemove}>
            <TrashBin className="size-4" />
          </IconAction>
        </div>
      </div>
      {matched_count > 0 && (
        <p className="flex items-center gap-1.5 ps-[4.5rem] text-xs text-accent">
          <CircleInfo className="size-3.5" />
          Подходит {matched_count} {plural(matched_count, ["заявка", "заявки", "заявок"])} без источника
        </p>
      )}
    </div>
  );
}
