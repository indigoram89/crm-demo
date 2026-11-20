import {Calendar, Check, Plus} from "@gravity-ui/icons";
import {Button, Card, Chip, Disclosure, Input, TextField, toast} from "@heroui/react";
import {type FormEvent, useState} from "react";

import {type Lead, type LeadTask, updateLead} from "@/entities/lead";
import {createId, formatDateTime} from "@/shared/lib/format";

function TaskCard({task, onDone}: {task: LeadTask; onDone?: () => void}) {
  const is_overdue = !task.is_done && new Date(task.due_at) < new Date();

  return (
    <Card variant="secondary">
      <Card.Content className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Chip color={task.is_done ? "success" : is_overdue ? "danger" : "warning"} size="sm" variant="soft">
            {task.is_done ? "Выполнена" : is_overdue ? "Просрочена" : "Ожидает"}
          </Chip>
        </div>
        <p className={`text-sm font-medium ${task.is_done ? "text-muted line-through" : "text-foreground"}`}>
          {task.title}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <Calendar className="size-3.5" />
          <span className="tabular-nums">{formatDateTime(task.due_at)}</span> · {task.author}
        </p>
        {onDone && (
          <div>
            <Button size="sm" variant="secondary" onPress={onDone}>
              <Check className="size-4" />
              Выполнена
            </Button>
          </div>
        )}
      </Card.Content>
    </Card>
  );
}

/** Задачи по заявке: новая задача, открытые сверху, выполненные свёрнуты. */
export function TasksPanel({lead}: {lead: Lead}) {
  const [title, setTitle] = useState("");

  const open_tasks = lead.tasks.filter((task) => !task.is_done);
  const done_tasks = lead.tasks.filter((task) => task.is_done);

  const addTask = (event: FormEvent) => {
    event.preventDefault();
    const value = title.trim().slice(0, 120);

    if (!value) return;

    const due_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    updateLead(lead.id, {
      tasks: [...lead.tasks, {id: createId(), title: value, due_at, is_done: false, author: lead.manager}],
    });
    setTitle("");
    toast.success("Задача добавлена на завтра");
  };

  const completeTask = (id: string) =>
    updateLead(lead.id, {tasks: lead.tasks.map((task) => (task.id === id ? {...task, is_done: true} : task))});

  return (
    <div className="flex flex-col gap-3">
      <form className="flex gap-2" onSubmit={addTask}>
        <TextField fullWidth aria-label="Новая задача" maxLength={120} value={title} onChange={setTitle}>
          <Input placeholder="Новая задача — введите и нажмите Enter" variant="secondary" />
        </TextField>
        <Button isIconOnly aria-label="Добавить задачу" isDisabled={!title.trim()} type="submit" variant="secondary">
          <Plus className="size-4" />
        </Button>
      </form>

      {open_tasks.map((task) => (
        <TaskCard key={task.id} task={task} onDone={() => completeTask(task.id)} />
      ))}

      {open_tasks.length === 0 && <p className="py-2 text-center text-sm text-muted">Открытых задач нет</p>}

      {done_tasks.length > 0 && (
        <Disclosure>
          <Disclosure.Heading>
            <Button fullWidth size="sm" slot="trigger" variant="ghost">
              Показать выполненные · {done_tasks.length}
              <Disclosure.Indicator />
            </Button>
          </Disclosure.Heading>
          <Disclosure.Content>
            <Disclosure.Body className="flex flex-col gap-3 pt-2">
              {done_tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </Disclosure.Body>
          </Disclosure.Content>
        </Disclosure>
      )}
    </div>
  );
}
