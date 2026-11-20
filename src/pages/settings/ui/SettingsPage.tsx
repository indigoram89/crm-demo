import type {ReactNode} from "react";

import {Briefcase, Comment, Compass, House, SquareLetterT, Tag} from "@gravity-ui/icons";
import type {Key} from "@heroui/react";

import {Header, ListBox, Select} from "@heroui/react";

import {type DirectoryId, useDirectories} from "@/entities/directory";
import {PageHeader} from "@/shared/ui/PageHeader";
import {DirectoryEditor} from "@/widgets/directory-editor";
import {UtmRulesEditor} from "@/widgets/utm-rules";

export type SettingsSection = DirectoryId | "utm";

const directory_icons: Record<DirectoryId, ReactNode> = {
  channels: <Comment className="size-5" />,
  sources: <Compass className="size-5" />,
  object_types: <House className="size-5" />,
  positions: <Briefcase className="size-5" />,
  units: <SquareLetterT className="size-5" />,
};

export const settings_sections: SettingsSection[] = [
  "channels",
  "sources",
  "object_types",
  "positions",
  "units",
  "utm",
];

/** Выбранный раздел подсвечиваем поверхностью с тенью, как активный пункт навигации. */
const nav_item_class = "data-[selected=true]:bg-surface data-[selected=true]:shadow-surface";

type Props = {
  section: SettingsSection;
  navigate: (href: string) => void;
};

export function SettingsPage({section, navigate}: Props) {
  const directories = useDirectories();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-8 pb-16 sm:px-8">
      <PageHeader description="Параметры работы системы и справочники" title="Настройки" />

      <div className="grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <Select
          aria-label="Раздел настроек"
          className="lg:hidden"
          value={section}
          onChange={(key: Key | Key[] | null) => key && navigate(`/settings/${String(key)}`)}
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Section>
                <Header>Справочники</Header>
                {Object.values(directories).map((directory) => (
                  <ListBox.Item key={directory.id} id={directory.id} textValue={directory.title}>
                    {directory.title}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox.Section>
              <ListBox.Section>
                <Header>Подключения</Header>
                <ListBox.Item id="utm" textValue="UTM-метки">
                  UTM-метки
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox.Section>
            </ListBox>
          </Select.Popover>
        </Select>

        <nav aria-label="Разделы настроек" className="hidden lg:sticky lg:top-6 lg:block">
          <ListBox
            aria-label="Разделы настроек"
            disallowEmptySelection
            selectedKeys={[section]}
            selectionMode="single"
            onSelectionChange={(keys) => {
              const [key] = [...(keys as Set<string>)];

              if (key) navigate(`/settings/${key}`);
            }}
          >
            <ListBox.Section>
              <Header>Справочники</Header>
              {Object.values(directories).map((directory) => (
                <ListBox.Item
                  key={directory.id}
                  className={nav_item_class}
                  id={directory.id}
                  textValue={directory.title}
                >
                  <span className="text-muted">{directory_icons[directory.id]}</span>
                  <span className="flex-1 truncate">{directory.title}</span>
                  <span className="text-xs text-muted tabular-nums">{directory.items.length}</span>
                </ListBox.Item>
              ))}
            </ListBox.Section>
            <ListBox.Section>
              <Header>Подключения</Header>
              <ListBox.Item className={nav_item_class} id="utm" textValue="UTM-метки">
                <span className="text-muted">
                  <Tag className="size-5" />
                </span>
                <span className="flex-1">UTM-метки</span>
              </ListBox.Item>
            </ListBox.Section>
          </ListBox>
        </nav>

        <section aria-label="Содержимое раздела" className="min-w-0">
          {section === "utm" ? (
            <UtmRulesEditor />
          ) : (
            <DirectoryEditor key={section} directory={directories[section]} icon={directory_icons[section]} />
          )}
        </section>
      </div>
    </div>
  );
}
