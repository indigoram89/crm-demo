import {Check} from "@gravity-ui/icons";
import {Button, Kbd} from "@heroui/react";

import {useSaveShortcut} from "../model/use-save-shortcut";

type Props = {
  is_dirty: boolean;
  onSave: () => void;
  onReset: () => void;
};

/** Статус изменений и кнопка «Сохранить» с подсказкой ⌘S. */
export function SaveBar({is_dirty, onSave, onReset}: Props) {
  useSaveShortcut(onSave, is_dirty);

  return (
    <div className="flex items-center gap-3">
      <span aria-live="polite" className="flex items-center gap-2 text-sm text-muted">
        {is_dirty ? (
          <>
            <span aria-hidden className="size-2 rounded-full bg-warning" />
            Есть несохранённые изменения
          </>
        ) : (
          <>
            <Check aria-hidden className="size-4 text-success" />
            Все изменения сохранены
          </>
        )}
      </span>
      <span className="flex-1" />
      {is_dirty && (
        <Button variant="ghost" onPress={onReset}>
          Отменить
        </Button>
      )}
      <Button isDisabled={!is_dirty} onPress={onSave}>
        Сохранить
        <Kbd className="hidden text-accent-foreground/70 sm:inline-flex" variant="light">
          <Kbd.Abbr keyValue="command" />
          <Kbd.Content>S</Kbd.Content>
        </Kbd>
      </Button>
    </div>
  );
}
