import {Plus, Tag} from "@gravity-ui/icons";
import {Alert, Button, Card, Chip, Tabs, toast} from "@heroui/react";
import {EmptyState} from "@heroui-pro/react/empty-state";
import {ListView} from "@heroui-pro/react/list-view";
import {useState} from "react";
import {useDragAndDrop} from "react-aria-components";

import {useDirectory} from "@/entities/directory";
import {type UtmField, assignSources, useLeads, utm_field_labels} from "@/entities/lead";
import {SaveBar} from "@/features/save-changes";
import {createId} from "@/shared/lib/format";
import {reorderItems} from "@/shared/lib/reorder";
import {plural} from "@/shared/lib/plural";
import {useUnsavedChanges} from "@/shared/lib/unsaved-changes";

import {type UtmRule, getUnmatchedTags, matchLeads, saveRules, useRules} from "@/entities/utm-rule";
import {RuleRow, rule_grid} from "./RuleRow";
import {UtmLinkBuilder} from "./UtmLinkBuilder";

const leadsWord = (count: number) => plural(count, ["заявки", "заявок", "заявок"]);

export function UtmRulesEditor() {
  const saved = useRules();
  const leads = useLeads();
  const sources = useDirectory("sources");

  const [draft, setDraft] = useState(saved);
  const is_dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  useUnsavedChanges(is_dirty);

  const {assignments, per_rule, unmatched} = matchLeads(draft, leads);
  const unmatched_tags = getUnmatchedTags(draft, leads);

  const updateRule = (id: string, patch: Partial<UtmRule>) =>
    setDraft((prev) => prev.map((rule) => (rule.id === id ? {...rule, ...patch} : rule)));

  const addRule = () =>
    setDraft((prev) => [
      ...prev,
      {id: createId(), field: "utm_source", condition: "equals", value: "", source_id: null, is_enabled: true},
    ]);

  const hasRuleFor = (field: UtmField, value: string) =>
    draft.some((rule) => rule.field === field && rule.value.trim().toLocaleLowerCase() === value.toLocaleLowerCase());

  const createRuleFromTag = (field: UtmField, value: string) => {
    setDraft((prev) => [
      ...prev,
      {id: createId(), field, condition: "equals", value, source_id: null, is_enabled: true},
    ]);
    toast.success("Правило добавлено", {description: "Выберите для него источник на вкладке «Правила» и сохраните"});
  };

  const save = () => {
    if (draft.some((rule) => !rule.value.trim() || !rule.source_id)) {
      toast.danger("Не все правила заполнены", {description: "У каждого правила нужны значение и источник"});

      return;
    }

    saveRules(draft);
    toast.success("Правила сохранены");
  };

  const applySources = () => {
    const count = assignments.size;

    assignSources(assignments);
    toast.success(`Источник проставлен у ${count} ${leadsWord(count)}`);
  };

  const {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map((key) => ({"text/plain": String(key)})),
    onReorder: (event) => setDraft((prev) => reorderItems(prev, event.keys, event.target)),
  });

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <Card.Header className="flex-row items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-secondary text-muted">
            <Tag className="size-5" />
          </span>
          <div className="flex flex-col gap-0.5">
            <Card.Title>UTM-метки</Card.Title>
            <Card.Description>
              По меткам обращения заявке выбирается «Источник трафика». Правила общие для звонков, форм и ботов
            </Card.Description>
          </div>
        </Card.Header>

        <Card.Content>
          <Tabs>
            <Tabs.ListContainer>
              <Tabs.List aria-label="Разделы UTM-меток">
                <Tabs.Tab id="rules">
                  Правила
                  <Chip size="sm" variant="soft">
                    {draft.length}
                  </Chip>
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="incoming">
                  Пришедшие метки
                  {unmatched_tags.length > 0 && (
                    <Chip color="danger" size="sm" variant="soft">
                      {unmatched_tags.length}
                    </Chip>
                  )}
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="link">
                  Ссылка с UTM
                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>

            <Tabs.Panel className="flex flex-col gap-4 pt-4" id="rules">
              {assignments.size > 0 && (
                <Alert status="accent">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>
                      Можно заполнить источник у {assignments.size} {leadsWord(assignments.size)}
                    </Alert.Title>
                    <Alert.Description>
                      У них пустой источник, а метки подходят под правила. Заявки с указанным источником не изменятся.
                      {unmatched > 0 && ` Ещё у ${unmatched} ${leadsWord(unmatched)} нет подходящего правила.`}
                      {is_dirty && " Сначала сохраните правила."}
                    </Alert.Description>
                    <Button
                      className="mt-2 sm:hidden"
                      isDisabled={is_dirty}
                      size="sm"
                      variant="secondary"
                      onPress={applySources}
                    >
                      Проставить источник ({assignments.size})
                    </Button>
                  </Alert.Content>
                  <Button
                    className="hidden sm:flex"
                    isDisabled={is_dirty}
                    size="sm"
                    variant="secondary"
                    onPress={applySources}
                  >
                    Проставить источник ({assignments.size})
                  </Button>
                </Alert>
              )}

              <div aria-hidden className={`${rule_grid} hidden px-3 text-xs text-muted lg:grid`}>
                <span />
                <span className="text-center">№</span>
                <span>Поле</span>
                <span>Условие</span>
                <span>Значение</span>
                <span>Источник трафика</span>
                <span>Вкл.</span>
              </div>

              <ListView
                aria-label="Правила UTM-меток"
                dependencies={[draft, per_rule, sources]}
                dragAndDropHooks={dragAndDropHooks}
                items={draft}
                renderEmptyState={() => (
                  <EmptyState size="sm">
                    <EmptyState.Header>
                      <EmptyState.Title>Правил пока нет</EmptyState.Title>
                      <EmptyState.Description>Добавьте первое правило ниже</EmptyState.Description>
                    </EmptyState.Header>
                  </EmptyState>
                )}
                variant="secondary"
              >
                {(rule) => (
                  <ListView.Item id={rule.id} textValue={`${utm_field_labels[rule.field]} ${rule.value}`}>
                    <RuleRow
                      index={draft.indexOf(rule)}
                      matched_count={per_rule.get(rule.id) ?? 0}
                      rule={rule}
                      sources={sources}
                      onChange={(patch) => updateRule(rule.id, patch)}
                      onRemove={() => setDraft((prev) => prev.filter((entry) => entry.id !== rule.id))}
                    />
                  </ListView.Item>
                )}
              </ListView>

              <div>
                <Button variant="outline" onPress={addRule}>
                  <Plus className="size-4" />
                  Правило
                </Button>
              </div>
            </Tabs.Panel>

            <Tabs.Panel className="pt-4" id="incoming">
              {unmatched_tags.length === 0 ? (
                <EmptyState size="sm">
                  <EmptyState.Header>
                    <EmptyState.Title>Все метки разобраны</EmptyState.Title>
                    <EmptyState.Description>Под каждую пришедшую метку есть правило</EmptyState.Description>
                  </EmptyState.Header>
                </EmptyState>
              ) : (
                <ListView
                  aria-label="Метки без правил"
                  items={unmatched_tags.map((tag) => ({...tag, id: `${tag.field}=${tag.value}`}))}
                  variant="secondary"
                >
                  {(tag) => (
                    <ListView.Item id={tag.id} textValue={tag.value}>
                      <ListView.ItemContent>
                        <div className="flex min-w-0 flex-col">
                          <ListView.Title className="font-mono">{tag.value}</ListView.Title>
                          <ListView.Description>
                            {utm_field_labels[tag.field]} · {tag.count}{" "}
                            {plural(tag.count, ["заявка", "заявки", "заявок"])}
                          </ListView.Description>
                        </div>
                      </ListView.ItemContent>
                      <ListView.ItemAction>
                        <Button
                          isDisabled={hasRuleFor(tag.field, tag.value)}
                          size="sm"
                          variant="secondary"
                          onPress={() => createRuleFromTag(tag.field, tag.value)}
                        >
                          {hasRuleFor(tag.field, tag.value) ? "Правило добавлено" : "Создать правило"}
                        </Button>
                      </ListView.ItemAction>
                    </ListView.Item>
                  )}
                </ListView>
              )}
            </Tabs.Panel>

            <Tabs.Panel className="pt-4" id="link">
              <UtmLinkBuilder />
            </Tabs.Panel>
          </Tabs>
        </Card.Content>
      </Card>

      <Card>
        <Card.Content>
          <SaveBar is_dirty={is_dirty} onReset={() => setDraft(saved)} onSave={save} />
        </Card.Content>
      </Card>
    </div>
  );
}
