import {Calculator, Copy, Handset, Link, MapPin, Pencil, Person} from "@gravity-ui/icons";
import {Avatar, Card, Chip, Label, Modal, NumberField, Tabs, TextArea, TextField, toast} from "@heroui/react";
import {EmptyState} from "@heroui-pro/react/empty-state";
import {Segment} from "@heroui-pro/react/segment";
import {useState} from "react";

import {DirectorySelect, useDirectory} from "@/entities/directory";
import {EmployeePicker} from "@/entities/employee";
import {type Lead, type LeadStage, stages, updateLead} from "@/entities/lead";
import {CreatableDirectorySelect} from "@/features/create-directory-item";
import {SaveBar} from "@/features/save-changes";
import {copyText} from "@/shared/lib/clipboard";
import {formatDateTime} from "@/shared/lib/format";
import {plural} from "@/shared/lib/plural";
import {useUnsavedChanges, warnUnsavedChanges} from "@/shared/lib/unsaved-changes";
import {IconAction} from "@/shared/ui/IconAction";

import {AttentionPanel} from "./AttentionPanel";
import {NeedsSection} from "./NeedsSection";
import {Section} from "./Section";
import {TasksPanel} from "./TasksPanel";

/** Поля, которые менеджер редактирует и сохраняет кнопкой «Сохранить». */
type Draft = Pick<Lead, "stage" | "assignee_id" | "channel_id" | "source_id" | "amount" | "needs" | "note"> & {
  object_type_id: string | null;
};

const toDraft = (lead: Lead): Draft => ({
  stage: lead.stage,
  assignee_id: lead.assignee_id,
  channel_id: lead.channel_id,
  source_id: lead.source_id,
  amount: lead.amount,
  needs: lead.needs,
  note: lead.note,
  object_type_id: lead.object?.type_id ?? null,
});

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

type Props = {
  lead: Lead;
  onClose: () => void;
};

export function LeadCard({lead, onClose}: Props) {
  const channels = useDirectory("channels");
  const sources = useDirectory("sources");
  const object_types = useDirectory("object_types");

  const [draft, setDraft] = useState(() => toDraft(lead));
  const saved = toDraft(lead);
  const is_dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  useUnsavedChanges(is_dirty);

  const patch = (value: Partial<Draft>) => setDraft((prev) => ({...prev, ...value}));

  const save = () => {
    const normalized = {...draft, note: draft.note.trim()};
    const {object_type_id, ...fields} = normalized;

    setDraft(normalized);
    updateLead(lead.id, {
      ...fields,
      object: lead.object && object_type_id ? {...lead.object, type_id: object_type_id} : lead.object,
    });
    toast.success(`Заявка №${lead.id} сохранена`);
  };

  const close = () => {
    if (is_dirty) {
      warnUnsavedChanges();

      return;
    }

    onClose();
  };

  const copyLink = () => copyText(window.location.href, "Ссылка на заявку скопирована");

  return (
    <Modal.Backdrop isOpen onOpenChange={(is_open) => !is_open && close()}>
      <Modal.Container scroll="inside" size="cover">
        <Modal.Dialog aria-label={`Заявка №${lead.id}`} className="max-w-6xl">
          <Modal.CloseTrigger />
          <Modal.Header className="flex flex-col items-stretch gap-3 pe-10">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Modal.Heading className="text-xl">Заявка №{lead.id}</Modal.Heading>
              <IconAction label="Скопировать ссылку на заявку" onPress={copyLink}>
                <Link className="size-4" />
              </IconAction>
              {lead.missed_calls > 0 && (
                <Chip color="danger" size="sm" variant="soft">
                  {lead.missed_calls} {plural(lead.missed_calls, ["пропущенный", "пропущенных", "пропущенных"])}
                </Chip>
              )}
              {lead.unread_messages > 0 && (
                <Chip color="success" size="sm" variant="soft">
                  {lead.unread_messages} в WhatsApp
                </Chip>
              )}
            </div>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <span>
                Создана <span className="text-foreground tabular-nums">{formatDateTime(lead.created_at)}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Avatar className="size-5" size="sm" variant="soft">
                  <Avatar.Fallback className="text-[9px]">{initials(lead.manager)}</Avatar.Fallback>
                </Avatar>
                <span className="text-foreground">{lead.manager}</span>
              </span>
            </p>
            <div className="-mx-1 overflow-x-auto px-1 pb-1">
              <Segment
                aria-label="Стадия заявки"
                selectedKey={draft.stage}
                size="sm"
                onSelectionChange={(key) => patch({stage: key as LeadStage})}
              >
                {stages.map((stage) => (
                  <Segment.Item key={stage.id} className="whitespace-nowrap" id={stage.id}>
                    {stage.label}
                  </Segment.Item>
                ))}
              </Segment>
            </div>
          </Modal.Header>

          <Modal.Body>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <Tabs>
                <Tabs.ListContainer>
                  <Tabs.List aria-label="Разделы заявки">
                    <Tabs.Tab id="main">
                      Основное
                      <Tabs.Indicator />
                    </Tabs.Tab>
                    <Tabs.Tab id="chat">
                      Переписка
                      {lead.unread_messages > 0 && (
                        <Chip color="success" size="sm" variant="soft">
                          {lead.unread_messages}
                        </Chip>
                      )}
                      <Tabs.Indicator />
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs.ListContainer>

                <Tabs.Panel className="flex flex-col gap-8 pt-6" id="main">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Section icon={<Person className="size-4" />} title="Клиент">
                      <Card variant="secondary">
                        <Card.Content className="flex flex-row items-start gap-3">
                          <Avatar size="sm" variant="soft">
                            <Avatar.Fallback>{initials(lead.client.name)}</Avatar.Fallback>
                          </Avatar>
                          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                            <p className="truncate font-medium text-foreground">{lead.client.name}</p>
                            <div className="flex flex-wrap gap-1.5">
                              <Chip size="sm" variant="soft">
                                {lead.client.leads_count}{" "}
                                {plural(lead.client.leads_count, ["заявка", "заявки", "заявок"])}
                              </Chip>
                              {lead.client.open_count > 0 && (
                                <Chip color="warning" size="sm" variant="soft">
                                  {lead.client.open_count}{" "}
                                  {plural(lead.client.open_count, ["открытая", "открытых", "открытых"])}
                                </Chip>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <a
                                className="text-sm text-foreground tabular-nums"
                                href={`tel:${lead.client.phone.replace(/[^\d+]/g, "")}`}
                              >
                                {lead.client.phone}
                              </a>
                              <IconAction label="Позвонить" onPress={() => toast(`Звоним ${lead.client.phone}…`)}>
                                <Handset className="size-4" />
                              </IconAction>
                              <IconAction
                                label="Скопировать номер"
                                onPress={() => copyText(lead.client.phone, "Номер скопирован")}
                              >
                                <Copy className="size-4" />
                              </IconAction>
                            </div>
                          </div>
                        </Card.Content>
                      </Card>
                    </Section>

                    <Section icon={<MapPin className="size-4" />} title="Объект">
                      {lead.object ? (
                        <div className="flex flex-col gap-3">
                          <Card variant="secondary">
                            <Card.Content className="flex flex-col gap-0.5">
                              <p className="font-medium text-foreground">{lead.object.title}</p>
                              <p className="text-sm text-muted">{lead.object.address}</p>
                            </Card.Content>
                          </Card>
                          <DirectorySelect
                            directory={object_types}
                            value={draft.object_type_id}
                            variant="secondary"
                            onChange={(object_type_id) => patch({object_type_id})}
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-muted">Объект не указан</p>
                      )}
                    </Section>
                  </div>

                  <Section
                    description="Откуда пришёл клиент и кто ведёт"
                    icon={<Link className="size-4" />}
                    title="Обращение"
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <EmployeePicker
                          label="Ответственный"
                          value={draft.assignee_id}
                          variant="secondary"
                          onChange={(assignee_id) => patch({assignee_id})}
                        />
                      </div>
                      <DirectorySelect
                        directory={channels}
                        value={draft.channel_id}
                        variant="secondary"
                        onChange={(channel_id) => patch({channel_id})}
                      />
                      <CreatableDirectorySelect
                        directory={sources}
                        value={draft.source_id}
                        variant="secondary"
                        onChange={(source_id) => patch({source_id})}
                      />
                    </div>
                  </Section>

                  <Section icon={<Calculator className="size-4" />} title="Расчёт">
                    <NumberField
                      className="max-w-xs"
                      formatOptions={{style: "currency", currency: "KZT", maximumFractionDigits: 0}}
                      maxValue={1_000_000_000}
                      minValue={0}
                      step={1}
                      value={draft.amount}
                      variant="secondary"
                      onChange={(amount) => patch({amount: Number.isFinite(amount) ? amount : 0})}
                    >
                      <Label>Предварительная сумма</Label>
                      <NumberField.Group>
                        <NumberField.Input className="tabular-nums" />
                      </NumberField.Group>
                    </NumberField>
                  </Section>

                  <NeedsSection needs={draft.needs} onChange={(needs) => patch({needs})} />

                  <Section icon={<Pencil className="size-4" />} title="Заметка">
                    <TextField
                      aria-label="Заметка"
                      maxLength={2000}
                      value={draft.note}
                      onChange={(note) => patch({note})}
                    >
                      <TextArea
                        placeholder="Важные детали для коллег: удобное время, этаж, пожелания"
                        rows={3}
                        variant="secondary"
                      />
                    </TextField>
                  </Section>
                </Tabs.Panel>

                <Tabs.Panel className="pt-6" id="chat">
                  <EmptyState size="sm">
                    <EmptyState.Header>
                      <EmptyState.Title>Переписка подключается в интеграциях</EmptyState.Title>
                      <EmptyState.Description>
                        {lead.last_message ? `Последнее сообщение: «${lead.last_message}»` : "Сообщений пока нет"}
                      </EmptyState.Description>
                    </EmptyState.Header>
                  </EmptyState>
                </Tabs.Panel>
              </Tabs>

              <aside aria-label="Что требует внимания" className="flex flex-col gap-6">
                <AttentionPanel lead={lead} />
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-foreground">Задачи</h3>
                  <TasksPanel lead={lead} />
                </div>
              </aside>
            </div>
          </Modal.Body>

          <Modal.Footer className="block">
            <SaveBar is_dirty={is_dirty} onReset={() => setDraft(saved)} onSave={save} />
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
