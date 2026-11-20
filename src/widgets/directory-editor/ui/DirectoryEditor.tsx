import {Eye, EyeSlash, Grip, Plus, Star, StarFill, TrashBin} from "@gravity-ui/icons";
import {Button, Card, Chip, InputGroup, TextField, toast} from "@heroui/react";
import {ListView} from "@heroui-pro/react/list-view";
import {type FormEvent, useState} from "react";
import {useDragAndDrop} from "react-aria-components";

import {type Directory, type DirectoryItem, saveDirectory} from "@/entities/directory";
import {useLeads} from "@/entities/lead";
import {useRules} from "@/entities/utm-rule";
import {SaveBar} from "@/features/save-changes";
import {createId} from "@/shared/lib/format";
import {reorderItems} from "@/shared/lib/reorder";
import {plural} from "@/shared/lib/plural";
import {useUnsavedChanges} from "@/shared/lib/unsaved-changes";
import {IconAction} from "@/shared/ui/IconAction";
import {KeyboardIsolation} from "@/shared/ui/KeyboardIsolation";

import {countUsage} from "../model/usage";
import {DirectoryPreview} from "./DirectoryPreview";

const MAX_LENGTH = 60;

type Props = {
  directory: Directory;
  icon: React.ReactNode;
};

/** Редактор справочника: порядок, значение по умолчанию, скрытие, добавление и удаление. */
export function DirectoryEditor({directory, icon}: Props) {
  const [draft, setDraft] = useState(directory);
  const [saved, setSaved] = useState(directory);
  const [new_name, setNewName] = useState("");
  const leads = useLeads();
  const rules = useRules();
  const live_usage = countUsage(directory.id, leads, rules);
  // used_count — записи вне демо (история), плюс заявки и UTM-правила, которые ссылаются на значение сейчас.
  const usageOf = (item: DirectoryItem) => item.used_count + (live_usage.get(item.id) ?? 0);

  const is_dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  useUnsavedChanges(is_dirty);

  // Справочник могли пополнить из формы заявки. Если своих правок нет — подхватываем новую версию.
  if (saved !== directory) {
    setSaved(directory);
    if (!is_dirty) setDraft(directory);
  }
  const hidden_count = draft.items.filter((item) => item.is_hidden).length;
  const has_empty_names = draft.items.some((item) => !item.name.trim());

  const updateItem = (id: string, patch: Partial<DirectoryItem>) =>
    setDraft((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? {...item, ...patch} : item)),
    }));

  const toggleDefault = (id: string) => setDraft((prev) => ({...prev, default_id: prev.default_id === id ? null : id}));

  const toggleHidden = (item: DirectoryItem) =>
    setDraft((prev) => ({
      ...prev,
      // Скрытое значение не может быть значением по умолчанию.
      default_id: !item.is_hidden && prev.default_id === item.id ? null : prev.default_id,
      items: prev.items.map((entry) => (entry.id === item.id ? {...entry, is_hidden: !entry.is_hidden} : entry)),
    }));

  const removeItem = (item: DirectoryItem) => {
    const used = usageOf(item);

    if (used > 0) {
      toast.warning(`«${item.name}» уже выбрано в ${used} ${plural(used, ["записи", "записях", "записях"])}`, {
        description: "Удалить нельзя — скройте его, чтобы оно больше не предлагалось",
      });

      return;
    }

    setDraft((prev) => ({
      ...prev,
      default_id: prev.default_id === item.id ? null : prev.default_id,
      items: prev.items.filter((entry) => entry.id !== item.id),
    }));
  };

  const addItem = (event: FormEvent) => {
    event.preventDefault();
    const name = new_name.trim().slice(0, MAX_LENGTH);

    if (!name) return;

    if (draft.items.some((item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      toast.warning(`«${name}» уже есть в списке`);

      return;
    }

    setDraft((prev) => ({...prev, items: [...prev.items, {id: createId(), name, is_hidden: false, used_count: 0}]}));
    setNewName("");
  };

  const save = () => {
    if (has_empty_names) {
      toast.danger("Есть пустые названия", {description: "Заполните или удалите их перед сохранением"});

      return;
    }

    const names = draft.items.map((item) => item.name.trim().toLocaleLowerCase());
    const duplicate = draft.items.find((item, index) => names.indexOf(names[index]!) !== index);

    if (duplicate) {
      toast.danger(`«${duplicate.name.trim()}» встречается дважды`, {
        description: "Названия в справочнике должны различаться",
      });

      return;
    }

    const normalized = {...draft, items: draft.items.map((item) => ({...item, name: item.name.trim()}))};

    setDraft(normalized);
    saveDirectory(normalized);
    toast.success("Справочник сохранён");
  };

  const {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map((key) => ({"text/plain": String(key)})),
    onReorder: (event) => setDraft((prev) => ({...prev, items: reorderItems(prev.items, event.keys, event.target)})),
  });

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex min-w-0 flex-col gap-4">
        <Card>
          <Card.Header className="flex-row items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-secondary text-muted">
              {icon}
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <Card.Title className="flex items-center gap-2">
                {draft.title}
                <Chip size="sm" variant="soft">
                  {draft.items.length}
                  {hidden_count > 0 && ` · ${hidden_count} скрыто`}
                </Chip>
              </Card.Title>
              <Card.Description>{draft.description}</Card.Description>
            </div>
          </Card.Header>

          <Card.Content className="flex flex-col gap-3">
            <ListView
              aria-label={`Значения: ${draft.title}`}
              dependencies={[draft.default_id]}
              dragAndDropHooks={dragAndDropHooks}
              items={draft.items}
              variant="secondary"
            >
              {(item) => {
                const is_default = draft.default_id === item.id;

                return (
                  <ListView.Item id={item.id} textValue={item.name}>
                    <ListView.ItemContent className="gap-2">
                      <IconAction label="Перетащите, чтобы изменить порядок" slot="drag">
                        <Grip className="size-4 text-muted" />
                      </IconAction>
                      <KeyboardIsolation className="min-w-0 flex-1">
                        <TextField
                          fullWidth
                          aria-label="Название"
                          isInvalid={!item.name.trim()}
                          maxLength={MAX_LENGTH}
                          value={item.name}
                          onChange={(name) => updateItem(item.id, {name})}
                        >
                          <InputGroup fullWidth variant="secondary">
                            <InputGroup.Input className={item.is_hidden ? "text-muted" : undefined} />
                            {(is_default || item.is_hidden) && (
                              <InputGroup.Suffix className="hidden sm:flex">
                                <Chip color={is_default ? "success" : "default"} size="sm" variant="soft">
                                  {is_default ? "По умолчанию" : "Скрыто"}
                                </Chip>
                              </InputGroup.Suffix>
                            )}
                          </InputGroup>
                        </TextField>
                      </KeyboardIsolation>
                    </ListView.ItemContent>
                    <ListView.ItemAction className="gap-0.5">
                      <IconAction
                        isDisabled={item.is_hidden}
                        label={is_default ? "Убрать значение по умолчанию" : "Сделать значением по умолчанию"}
                        onPress={() => toggleDefault(item.id)}
                      >
                        {is_default ? <StarFill className="size-4 text-warning" /> : <Star className="size-4" />}
                      </IconAction>
                      <IconAction
                        label={item.is_hidden ? "Показать в формах" : "Скрыть из форм"}
                        onPress={() => toggleHidden(item)}
                      >
                        {item.is_hidden ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
                      </IconAction>
                      <IconAction label="Удалить" onPress={() => removeItem(item)}>
                        <TrashBin className="size-4" />
                      </IconAction>
                    </ListView.ItemAction>
                  </ListView.Item>
                );
              }}
            </ListView>

            <form className="flex gap-2" onSubmit={addItem}>
              <TextField
                fullWidth
                aria-label="Новое значение"
                maxLength={MAX_LENGTH}
                value={new_name}
                onChange={setNewName}
              >
                <InputGroup fullWidth variant="secondary">
                  <InputGroup.Prefix>
                    <Plus className="size-4 text-muted" />
                  </InputGroup.Prefix>
                  <InputGroup.Input placeholder="Новое значение — введите и нажмите Enter" />
                </InputGroup>
              </TextField>
              <Button isDisabled={!new_name.trim()} type="submit" variant="secondary">
                Добавить
              </Button>
            </form>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <SaveBar is_dirty={is_dirty} onReset={() => setDraft(saved)} onSave={save} />
          </Card.Content>
        </Card>
      </div>

      <DirectoryPreview directory={draft} />
    </div>
  );
}
