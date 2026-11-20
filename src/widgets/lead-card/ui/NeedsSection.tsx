import type {Key} from "@heroui/react";

import {Box, Plus, TrashBin} from "@gravity-ui/icons";
import {Button, Description, Label, ListBox, NumberField, Select} from "@heroui/react";

import {useDirectory} from "@/entities/directory";
import {type LeadNeed, findProduct, products} from "@/entities/lead";
import {createId, formatMoney} from "@/shared/lib/format";
import {plural} from "@/shared/lib/plural";
import {IconAction} from "@/shared/ui/IconAction";

import {Section} from "./Section";

type Props = {
  needs: LeadNeed[];
  onChange: (needs: LeadNeed[]) => void;
};

/** «Что хочет заказать клиент»: продукция, количество в своих единицах и итог по позициям. */
export function NeedsSection({needs, onChange}: Props) {
  const units = useDirectory("units");
  const unitName = (id: string) => units.items.find((unit) => unit.id === id)?.name ?? "";

  const total = needs.reduce((sum, need) => sum + (findProduct(need.product_id)?.price ?? 0) * need.quantity, 0);

  const update = (id: string, patch: Partial<LeadNeed>) =>
    onChange(needs.map((need) => (need.id === id ? {...need, ...patch} : need)));

  const add = () => {
    const product = products[0]!;

    onChange([...needs, {id: createId(), product_id: product.id, quantity: 1, unit_id: product.unit_id}]);
  };

  return (
    <Section
      aside={`${needs.length} ${plural(needs.length, ["позиция", "позиции", "позиций"])}`}
      description="Что хочет заказать"
      icon={<Box className="size-4" />}
      title="Потребности клиента"
    >
      <div className="flex flex-col gap-2">
        {needs.map((need, index) => (
          <div key={need.id} className="grid grid-cols-[minmax(0,1fr)_9rem_auto] items-end gap-2">
            <Select
              aria-label={index === 0 ? undefined : "Продукция"}
              value={need.product_id}
              variant="secondary"
              onChange={(key: Key | Key[] | null) => {
                const product = key ? findProduct(String(key)) : undefined;

                if (product) update(need.id, {product_id: product.id, unit_id: product.unit_id});
              }}
            >
              {index === 0 && <Label>Продукция</Label>}
              <Select.Trigger>
                <Select.Value>
                  {() => {
                    const product = findProduct(need.product_id);

                    return product ? (
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="truncate">{product.name}</span>
                        <span className="truncate text-xs text-muted">{product.vendor}</span>
                      </span>
                    ) : null;
                  }}
                </Select.Value>
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {products.map((product) => (
                    <ListBox.Item key={product.id} id={product.id} textValue={product.name}>
                      <div className="flex flex-col">
                        <Label>{product.name}</Label>
                        <Description>
                          {product.vendor} · {formatMoney(product.price)} за {unitName(product.unit_id)}
                        </Description>
                      </div>
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>

            <NumberField
              aria-label={index === 0 ? undefined : "Количество"}
              formatOptions={{maximumFractionDigits: 2}}
              maxValue={10_000}
              minValue={0}
              step={need.unit_id === "pcs" ? 1 : 0.5}
              value={need.quantity}
              variant="secondary"
              onChange={(quantity) => Number.isFinite(quantity) && quantity > 0 && update(need.id, {quantity})}
            >
              {index === 0 && <Label>Количество, {unitName(need.unit_id)}</Label>}
              <NumberField.Group>
                <NumberField.DecrementButton />
                <NumberField.Input className="text-center tabular-nums" />
                <NumberField.IncrementButton />
              </NumberField.Group>
            </NumberField>

            <IconAction label="Удалить позицию" onPress={() => onChange(needs.filter((entry) => entry.id !== need.id))}>
              <TrashBin className="size-4" />
            </IconAction>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <Button size="sm" variant="ghost" onPress={add}>
          <Plus className="size-4" />
          Позиция
        </Button>
        {needs.length > 0 && (
          <span className="text-sm text-muted">
            По прайсу: <span className="font-medium text-foreground tabular-nums">{formatMoney(total)}</span>
          </span>
        )}
      </div>
    </Section>
  );
}
