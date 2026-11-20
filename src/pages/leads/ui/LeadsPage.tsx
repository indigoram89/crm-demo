import {Comments, Handset} from "@gravity-ui/icons";
import {Avatar, Chip, SearchField} from "@heroui/react";
import {EmptyState} from "@heroui-pro/react/empty-state";
import {ListView} from "@heroui-pro/react/list-view";
import {Segment} from "@heroui-pro/react/segment";
import {useState} from "react";

import {useDirectory} from "@/entities/directory";
import {type Lead, stages, useLeads} from "@/entities/lead";
import {formatDateTime, formatMoney} from "@/shared/lib/format";
import {PageHeader} from "@/shared/ui/PageHeader";
import {LeadCard} from "@/widgets/lead-card";

type Filter = "all" | "attention" | "no_source";

const filters: {id: Filter; label: string; test: (lead: Lead) => boolean}[] = [
  {id: "all", label: "Все", test: () => true},
  {id: "attention", label: "Ждут ответа", test: (lead) => lead.missed_calls > 0 || lead.unread_messages > 0},
  {id: "no_source", label: "Без источника", test: (lead) => !lead.source_id},
];

type Props = {
  lead_id: number | null;
  navigate: (href: string) => void;
};

export function LeadsPage({lead_id, navigate}: Props) {
  const leads = useLeads();
  const sources = useDirectory("sources");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const open_lead = leads.find((lead) => lead.id === lead_id);
  const test = filters.find((entry) => entry.id === filter)!.test;
  const normalized = query.trim().toLocaleLowerCase();
  const visible = leads.filter(
    (lead) =>
      test(lead) &&
      (!normalized ||
        lead.client.name.toLocaleLowerCase().includes(normalized) ||
        String(lead.id).includes(normalized)),
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pt-8 pb-16 sm:px-8">
      <PageHeader description="Обращения клиентов: звонки, формы, мессенджеры" title="Заявки" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchField aria-label="Поиск заявок" className="sm:max-w-xs" value={query} onChange={setQuery}>
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Клиент или номер заявки" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <div className="overflow-x-auto">
          <Segment
            aria-label="Фильтр заявок"
            selectedKey={filter}
            onSelectionChange={(key) => setFilter(key as Filter)}
          >
            {filters.map((entry) => (
              <Segment.Item key={entry.id} className="whitespace-nowrap" id={entry.id}>
                {entry.label} · {leads.filter(entry.test).length}
              </Segment.Item>
            ))}
          </Segment>
        </div>
      </div>

      <ListView
        aria-label="Заявки"
        dependencies={[sources]}
        items={visible}
        renderEmptyState={() => (
          <EmptyState size="sm">
            <EmptyState.Header>
              <EmptyState.Title>Ничего не нашли</EmptyState.Title>
              <EmptyState.Description>Измените поиск или фильтр</EmptyState.Description>
            </EmptyState.Header>
          </EmptyState>
        )}
        onAction={(key) => navigate(`/leads/${key}`)}
      >
        {(lead) => {
          const stage = stages.find((entry) => entry.id === lead.stage)!;
          const source = sources.items.find((item) => item.id === lead.source_id);

          return (
            <ListView.Item id={lead.id} textValue={`${lead.id} ${lead.client.name}`}>
              <ListView.ItemContent>
                <Avatar size="sm" variant="soft">
                  <Avatar.Fallback>
                    {lead.client.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </Avatar.Fallback>
                </Avatar>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <ListView.Title className="flex items-center gap-2">
                    <span className="truncate">{lead.client.name}</span>
                    {lead.missed_calls > 0 && (
                      <Handset aria-label="Пропущенный звонок" className="size-3.5 shrink-0 text-danger" />
                    )}
                    {lead.unread_messages > 0 && (
                      <Comments aria-label="Непрочитанные сообщения" className="size-3.5 shrink-0 text-success" />
                    )}
                  </ListView.Title>
                  <ListView.Description className="flex flex-wrap items-center gap-x-2">
                    <span className="tabular-nums">№{lead.id}</span>
                    <span>·</span>
                    <span className="tabular-nums">{formatDateTime(lead.created_at)}</span>
                    <span>·</span>
                    {source ? <span>{source.name}</span> : <span className="text-warning">без источника</span>}
                  </ListView.Description>
                </div>
              </ListView.ItemContent>
              <ListView.ItemAction className="gap-3">
                {lead.amount > 0 && (
                  <span className="hidden text-sm font-medium text-foreground tabular-nums sm:inline">
                    {formatMoney(lead.amount)}
                  </span>
                )}
                <Chip color={stage.color} size="sm" variant="soft">
                  {stage.label}
                </Chip>
              </ListView.ItemAction>
            </ListView.Item>
          );
        }}
      </ListView>

      {open_lead && <LeadCard key={open_lead.id} lead={open_lead} onClose={() => navigate("/leads")} />}
    </div>
  );
}
