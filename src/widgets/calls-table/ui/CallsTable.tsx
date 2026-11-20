import type {Key, Selection} from "@heroui/react";

import {Microphone, Sliders} from "@gravity-ui/icons";
import {
  Button,
  Chip,
  Dropdown,
  Header,
  Label,
  ListBox,
  Pagination,
  SearchField,
  Select,
  Tooltip,
  toast,
} from "@heroui/react";
import {type DataGridColumn, type DataGridSortDescriptor, DataGrid} from "@heroui-pro/react/data-grid";
import {EmptyState} from "@heroui-pro/react/empty-state";
import {Segment} from "@heroui-pro/react/segment";
import {useState} from "react";

import {type Call, type CallResult, call_results, calls, formatDuration} from "@/entities/call";
import {formatDateTime} from "@/shared/lib/format";

const columns: DataGridColumn<Call>[] = [
  {
    id: "started_at",
    header: "Дата и время",
    accessorKey: "started_at",
    isRowHeader: true,
    allowsSorting: true,
    pinned: "start",
    width: 160,
    cell: (call) => <span className="tabular-nums">{formatDateTime(call.started_at)}</span>,
  },
  {
    id: "phone",
    header: "Номер",
    accessorKey: "phone",
    minWidth: 190,
    cell: (call) => (
      <span className="flex items-center gap-2 whitespace-nowrap">
        <span className="tabular-nums">{call.phone}</span>
        {call.is_spam && (
          <Chip size="sm" variant="soft">
            Спам
          </Chip>
        )}
      </span>
    ),
  },
  {
    id: "contact",
    header: "Владелец",
    accessorKey: "contact",
    allowsSorting: true,
    width: 220,
    minWidth: 160,
    allowsResizing: true,
    cell: (call) =>
      call.contact ? (
        <span className="block truncate" title={call.contact}>
          {call.contact}
        </span>
      ) : (
        <span className="text-muted">Неизвестный номер</span>
      ),
  },
  {
    id: "result",
    header: "Итог",
    accessorKey: "result",
    allowsSorting: true,
    minWidth: 110,
    cell: (call) => (
      <Chip color={call_results[call.result].color} size="sm" variant="soft">
        {call_results[call.result].label}
      </Chip>
    ),
  },
  {
    id: "decision",
    header: "Решение",
    accessorKey: "decision",
    minWidth: 160,
    cellClassName: "whitespace-nowrap",
    cell: (call) => call.decision ?? <span className="text-muted">—</span>,
  },
  {id: "routed_to", header: "Кому направлен", accessorKey: "routed_to", minWidth: 150},
  {
    id: "answered_by",
    header: "Кто ответил",
    accessorKey: "answered_by",
    minWidth: 150,
    cell: (call) => call.answered_by ?? <span className="text-muted">—</span>,
  },
  {
    id: "duration",
    header: "Длительность",
    accessorKey: "duration_sec",
    allowsSorting: true,
    align: "end",
    minWidth: 120,
    sortFn: (a, b) => a.duration_sec - b.duration_sec,
    cell: (call) => <span className="tabular-nums">{formatDuration(call.duration_sec)}</span>,
  },
  {
    id: "lead",
    header: "Заявка",
    accessorKey: "lead_id",
    minWidth: 90,
    cell: (call) =>
      call.lead_id ? (
        <a className="text-accent" href={`#/leads/${call.lead_id}`}>
          №{call.lead_id}
        </a>
      ) : (
        <span className="text-muted">—</span>
      ),
  },
  {
    id: "record",
    header: "Запись",
    minWidth: 80,
    cell: (call) =>
      call.has_record ? (
        <Tooltip delay={300}>
          <Button
            isIconOnly
            aria-label="Прослушать запись"
            size="sm"
            variant="ghost"
            onPress={() => toast("В демо записей нет — здесь откроется плеер")}
          >
            <Microphone className="size-4" />
          </Button>
          <Tooltip.Content>
            <p>Прослушать запись</p>
          </Tooltip.Content>
        </Tooltip>
      ) : (
        <span className="text-muted">—</span>
      ),
  },
  {
    id: "tracking",
    header: "Коллтрекинг",
    accessorKey: "tracking",
    minWidth: 130,
    cell: (call) => call.tracking ?? <span className="text-muted">—</span>,
  },
];

const default_visible = new Set(columns.map((column) => column.id));

/**
 * Сортировка всего списка, а не одной страницы: DataGrid сам сортирует только то, что ему передали,
 * а мы передаём уже вырезанную страницу. Поэтому сортировку держим здесь и отдаём таблице как управляемую.
 */
function sortCalls(rows: Call[], descriptor: DataGridSortDescriptor): Call[] {
  const column = columns.find((entry) => entry.id === descriptor.column);

  if (!column) return rows;

  const compare =
    column.sortFn ??
    ((a: Call, b: Call) => {
      const key = column.accessorKey;

      return key ? String(a[key] ?? "").localeCompare(String(b[key] ?? ""), "ru", {numeric: true}) : 0;
    });
  const sorted = [...rows].sort(compare);

  return descriptor.direction === "descending" ? sorted.reverse() : sorted;
}
const page_sizes = [25, 50] as const;

type ResultFilter = CallResult | "all";

const result_options: {id: ResultFilter; label: string}[] = [
  {id: "all", label: "Все итоги"},
  ...(Object.keys(call_results) as CallResult[]).map((id) => ({id, label: call_results[id].label})),
];

/** Журнал звонков: фильтры, видимые колонки, сортировка и постраничный вывод. */
export function CallsTable() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ResultFilter>("all");
  const [visible, setVisible] = useState<Set<string>>(default_visible);
  const [page_size, setPageSize] = useState<(typeof page_sizes)[number]>(25);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<DataGridSortDescriptor>({column: "started_at", direction: "descending"});

  const normalized = query.trim().toLocaleLowerCase();
  const digits = normalized.replace(/\D/g, "");
  const filtered = calls.filter(
    (call) =>
      (result === "all" || call.result === result) &&
      (!normalized ||
        call.contact?.toLocaleLowerCase().includes(normalized) ||
        (digits.length > 0 && call.phone.replace(/\D/g, "").includes(digits))),
  );

  const sorted = sortCalls(filtered, sort);
  const total_pages = Math.max(1, Math.ceil(filtered.length / page_size));
  const current_page = Math.min(page, total_pages);
  const page_rows = sorted.slice((current_page - 1) * page_size, current_page * page_size);
  const first = filtered.length ? (current_page - 1) * page_size + 1 : 0;
  const last = Math.min(current_page * page_size, filtered.length);

  // Первая колонка закреплена и всегда видна: по ней строка узнаётся при горизонтальной прокрутке.
  const shown_columns = columns.filter((column) => column.id === "started_at" || visible.has(column.id));

  const resetPage = () => setPage(1);

  return (
    <div className="flex flex-col gap-4">
      <CallsToolbar
        query={query}
        result={result}
        visible={visible}
        onQueryChange={(value) => {
          setQuery(value);
          resetPage();
        }}
        onResultChange={(value) => {
          setResult(value);
          resetPage();
        }}
        onVisibleChange={setVisible}
      />
      <DataGrid
        allowsColumnResize
        aria-label="Звонки"
        columns={shown_columns}
        contentClassName="min-w-[1200px]"
        data={page_rows}
        sortDescriptor={sort}
        onSortChange={(descriptor) => {
          setSort(descriptor);
          resetPage();
        }}
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-muted tabular-nums">
              {first}–{last} из {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-muted sm:inline">Строк на странице</span>
              <Segment
                aria-label="Строк на странице"
                selectedKey={String(page_size)}
                size="sm"
                onSelectionChange={(key) => {
                  setPageSize(Number(key) as (typeof page_sizes)[number]);
                  resetPage();
                }}
              >
                {page_sizes.map((size) => (
                  <Segment.Item key={size} id={String(size)}>
                    {size}
                  </Segment.Item>
                ))}
              </Segment>
            </div>
            <Pagination size="sm">
              <Pagination.Content>
                <Pagination.Item>
                  <Pagination.Previous isDisabled={current_page === 1} onPress={() => setPage(current_page - 1)}>
                    <Pagination.PreviousIcon />
                  </Pagination.Previous>
                </Pagination.Item>
                {Array.from({length: total_pages}, (_, index) => index + 1).map((number) => (
                  <Pagination.Item key={number}>
                    <Pagination.Link isActive={number === current_page} onPress={() => setPage(number)}>
                      {number}
                    </Pagination.Link>
                  </Pagination.Item>
                ))}
                <Pagination.Item>
                  <Pagination.Next isDisabled={current_page === total_pages} onPress={() => setPage(current_page + 1)}>
                    <Pagination.NextIcon />
                  </Pagination.Next>
                </Pagination.Item>
              </Pagination.Content>
            </Pagination>
          </div>
        }
        getRowId={(call) => call.id}
        renderEmptyState={() => (
          <EmptyState size="sm">
            <EmptyState.Header>
              <EmptyState.Title>Звонков не найдено</EmptyState.Title>
              <EmptyState.Description>Измените поиск или фильтр</EmptyState.Description>
            </EmptyState.Header>
          </EmptyState>
        )}
      />
    </div>
  );
}

type ToolbarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  result: ResultFilter;
  onResultChange: (result: ResultFilter) => void;
  visible: Set<string>;
  onVisibleChange: (visible: Set<string>) => void;
};

function CallsToolbar({query, onQueryChange, result, onResultChange, visible, onVisibleChange}: ToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <SearchField aria-label="Поиск звонков" className="sm:max-w-xs" value={query} onChange={onQueryChange}>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="Номер или имя" />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>
      <Select
        aria-label="Итог звонка"
        className="sm:w-44"
        value={result}
        onChange={(key: Key | Key[] | null) => key && onResultChange(key as ResultFilter)}
      >
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {result_options.map((option) => (
              <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
                {option.label}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
      <span className="hidden flex-1 sm:block" />
      <Dropdown>
        <Button variant="secondary">
          <Sliders className="size-4" />
          Колонки
        </Button>
        <Dropdown.Popover className="min-w-56" placement="bottom end">
          <Dropdown.Menu
            aria-label="Видимые колонки"
            selectedKeys={visible}
            selectionMode="multiple"
            onSelectionChange={(keys: Selection) =>
              onVisibleChange(keys === "all" ? new Set(default_visible) : new Set([...keys].map(String)))
            }
          >
            <Dropdown.Section>
              <Header>Показывать колонки</Header>
              {columns
                .filter((column) => column.id !== "started_at")
                .map((column) => (
                  <Dropdown.Item key={column.id} id={column.id} textValue={String(column.header)}>
                    <Dropdown.ItemIndicator />
                    <Label>{String(column.header)}</Label>
                  </Dropdown.Item>
                ))}
            </Dropdown.Section>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </div>
  );
}
