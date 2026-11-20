import {Calendar, Check, Comments, Handset} from "@gravity-ui/icons";
import {Button, Card, Chip, toast} from "@heroui/react";

import {type Lead, updateLead} from "@/entities/lead";
import {createId} from "@/shared/lib/format";
import {plural} from "@/shared/lib/plural";

/** Что требует ответа прямо сейчас: пропущенные звонки и непрочитанные сообщения. */
export function AttentionPanel({lead}: {lead: Lead}) {
  const total = (lead.missed_calls > 0 ? 1 : 0) + (lead.unread_messages > 0 ? 1 : 0);

  if (total === 0) return null;

  const addCallbackTask = () => {
    const due_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    updateLead(lead.id, {
      missed_calls: 0,
      tasks: [
        ...lead.tasks,
        {id: createId(), title: "Перезвонить клиенту", due_at, is_done: false, author: lead.manager},
      ],
    });
    toast.success("Задача «Перезвонить клиенту» поставлена на ближайший час");
  };

  return (
    <Card className="border border-danger/30">
      <Card.Header className="flex-row items-center gap-2">
        <span aria-hidden className="size-2 rounded-full bg-danger" />
        <Card.Title className="text-sm">Ждёт ответа</Card.Title>
        <Chip className="ms-auto" color="danger" size="sm">
          {total}
        </Chip>
      </Card.Header>
      <Card.Content className="flex flex-col gap-5">
        {lead.missed_calls > 0 && (
          <div className="flex gap-3">
            <Handset className="mt-0.5 size-4 shrink-0 text-danger" />
            <div className="flex min-w-0 flex-col gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {lead.missed_calls}{" "}
                  {plural(lead.missed_calls, ["пропущенный звонок", "пропущенных звонка", "пропущенных звонков"])}
                </p>
                <p className="text-xs text-muted">Последний — сегодня в 09:44 · {lead.client.phone}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onPress={() => toast(`Звоним ${lead.client.phone}…`)}>
                  <Handset className="size-4" />
                  Перезвонить
                </Button>
                <Button size="sm" variant="secondary" onPress={addCallbackTask}>
                  <Calendar className="size-4" />
                  Поставить задачу
                </Button>
                <Button size="sm" variant="ghost" onPress={() => updateLead(lead.id, {missed_calls: 0})}>
                  Не перезванивать
                </Button>
              </div>
            </div>
          </div>
        )}

        {lead.unread_messages > 0 && (
          <div className="flex gap-3">
            <Comments className="mt-0.5 size-4 shrink-0 text-success" />
            <div className="flex min-w-0 flex-col gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {lead.unread_messages}{" "}
                  {plural(lead.unread_messages, [
                    "непрочитанное сообщение",
                    "непрочитанных сообщения",
                    "непрочитанных сообщений",
                  ])}{" "}
                  в WhatsApp
                </p>
                <p className="line-clamp-2 text-xs text-muted">Последнее — «{lead.last_message}»</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onPress={() => toast("Чат откроется во вкладке «Переписка»")}>
                  Открыть чат
                </Button>
                <Button size="sm" variant="ghost" onPress={() => updateLead(lead.id, {unread_messages: 0})}>
                  <Check className="size-4" />
                  Прочитано
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card.Content>
    </Card>
  );
}
