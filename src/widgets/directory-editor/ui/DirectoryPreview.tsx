import {CircleInfo, Eye} from "@gravity-ui/icons";
import {Button, Card, Disclosure} from "@heroui/react";
import {useState} from "react";

import {type Directory, DirectorySelect} from "@/entities/directory";

/** Живой предпросмотр: так поле выглядит в форме заявки с текущими (ещё не сохранёнными) настройками. */
export function DirectoryPreview({directory}: {directory: Directory}) {
  const [value, setValue] = useState<string | null>(directory.default_id);
  const default_item = directory.items.find((item) => item.id === directory.default_id);
  const hidden_count = directory.items.filter((item) => item.is_hidden).length;

  // Если значение удалили или скрыли в черновике — сбрасываем выбор в предпросмотре.
  const is_value_available = directory.items.some((item) => item.id === value && !item.is_hidden);
  const preview_value = is_value_available ? value : directory.default_id;

  return (
    <aside className="flex flex-col gap-4 xl:sticky xl:top-20">
      <Card>
        <Card.Header className="flex-row items-center gap-2">
          <Eye className="size-4 text-muted" />
          <Card.Title>Так увидят в форме</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-3">
          <DirectorySelect directory={directory} value={preview_value} variant="secondary" onChange={setValue} />
          <p className="text-sm text-muted">
            {default_item ? `В новой записи сразу стоит «${default_item.name}».` : "В новой записи поле пустое."}
            {hidden_count > 0 && ` Скрытые (${hidden_count}) не предлагаются.`}
          </p>
        </Card.Content>
      </Card>

      <Card>
        <Disclosure defaultExpanded>
          <Disclosure.Heading>
            <Button fullWidth slot="trigger" variant="ghost">
              <CircleInfo className="size-4 text-accent" />
              Как это работает
              <Disclosure.Indicator className="ms-auto" />
            </Button>
          </Disclosure.Heading>
          <Disclosure.Content>
            <Disclosure.Body>
              <ul className="flex list-disc flex-col gap-2 ps-5 pt-2 text-sm text-muted">
                <li>
                  Значения предлагаются в формах в том же порядке. Порядок меняется перетаскиванием за ручку слева.
                </li>
                <li>Звёздочка — значение по умолчанию. Оно одно или его нет.</li>
                <li>Скрытое значение не предлагается при новом выборе, но остаётся там, где его уже выбрали.</li>
                <li>Удалить можно только значение, которое ещё нигде не выбрано.</li>
                <li>Менеджер может дописать значение прямо из заявки — оно появится здесь.</li>
              </ul>
            </Disclosure.Body>
          </Disclosure.Content>
        </Disclosure>
      </Card>
    </aside>
  );
}
