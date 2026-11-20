type DropTarget = {key: string | number; dropPosition: "before" | "after" | "on"};

/**
 * Переставляет элементы после перетаскивания. Если цель — сам перетаскиваемый элемент
 * (отпустили на том же месте), порядок не меняется.
 */
export function reorderItems<T extends {id: string}>(items: T[], keys: Set<string | number>, target: DropTarget): T[] {
  const moving = items.filter((item) => keys.has(item.id));
  const rest = items.filter((item) => !keys.has(item.id));
  const target_index = rest.findIndex((item) => item.id === target.key);

  if (target_index === -1 || moving.length === 0) return items;

  const insert_at = target.dropPosition === "before" ? target_index : target_index + 1;

  return [...rest.slice(0, insert_at), ...moving, ...rest.slice(insert_at)];
}
