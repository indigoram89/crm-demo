import type {ReactNode} from "react";

import {ArrowRightFromSquare, ChevronDown, Gear, Handset, ListUl} from "@gravity-ui/icons";
import {Avatar, Breadcrumbs, Chip, Dropdown, Label} from "@heroui/react";
import {AppLayout} from "@heroui-pro/react/app-layout";
import {Navbar} from "@heroui-pro/react/navbar";
import {Sidebar} from "@heroui-pro/react/sidebar";

import type {Theme} from "@/shared/lib/theme";

import {ThemeSwitcher} from "./ThemeSwitcher";

type NavItem = {href: string; label: string; icon: ReactNode};

const nav_groups: {label: string; items: NavItem[]}[] = [
  {
    label: "CRM",
    items: [
      {href: "/leads", label: "Заявки", icon: <ListUl className="size-4" />},
      {href: "/calls", label: "Звонки", icon: <Handset className="size-4" />},
    ],
  },
  {label: "Администрирование", items: [{href: "/settings", label: "Настройки", icon: <Gear className="size-4" />}]},
];

type Props = {
  path: string;
  navigate: (href: string) => void;
  breadcrumbs: string[];
  /** Счётчики у пунктов меню, например заявки, ждущие ответа. */
  counters: Record<string, number>;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  children: ReactNode;
};

function Brand() {
  return (
    <div className="flex items-center gap-3 px-1 py-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">
        О
      </span>
      <span className="text-sm font-semibold text-foreground" data-sidebar="label">
        Окна CRM
      </span>
    </div>
  );
}

function NavMenu({path, counters}: {path: string; counters: Record<string, number>}) {
  return nav_groups.map((group) => (
    <Sidebar.Group key={group.label}>
      <Sidebar.GroupLabel>{group.label}</Sidebar.GroupLabel>
      <Sidebar.Menu aria-label={group.label}>
        {group.items.map((item) => (
          <Sidebar.MenuItem
            key={item.href}
            href={`#${item.href}`}
            id={item.href}
            isCurrent={path.startsWith(item.href)}
            textValue={item.label}
          >
            <Sidebar.MenuIcon>{item.icon}</Sidebar.MenuIcon>
            <Sidebar.MenuLabel>{item.label}</Sidebar.MenuLabel>
            {Boolean(counters[item.href]) && (
              <Sidebar.MenuChip>
                <Chip aria-label={`Ждут ответа: ${counters[item.href]}`} color="danger" size="sm" variant="soft">
                  {counters[item.href]}
                </Chip>
              </Sidebar.MenuChip>
            )}
          </Sidebar.MenuItem>
        ))}
      </Sidebar.Menu>
    </Sidebar.Group>
  ));
}

function UserMenu() {
  return (
    <Dropdown>
      <Dropdown.Trigger className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left outline-none hover:bg-default">
        <Avatar size="sm" variant="soft">
          <Avatar.Fallback>КВ</Avatar.Fallback>
        </Avatar>
        <span className="flex min-w-0 flex-col" data-sidebar="label">
          <span className="truncate text-sm font-medium text-foreground">Ким Виктория</span>
          <span className="truncate text-xs text-muted">Руководитель продаж</span>
        </span>
        <ChevronDown className="ms-auto size-3 text-muted" data-sidebar="label" />
      </Dropdown.Trigger>
      <Dropdown.Popover placement="top start">
        <Dropdown.Menu aria-label="Профиль">
          <Dropdown.Item id="logout" textValue="Выйти" variant="danger">
            <ArrowRightFromSquare className="size-4 text-danger" />
            <Label>Выйти</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

/** Каркас приложения на AppLayout: боковое меню, верхняя панель, контент. */
export function AppShell({path, navigate, breadcrumbs, counters, theme, onThemeChange, children}: Props) {
  return (
    <AppLayout
      navigate={navigate}
      // В Glass боковая панель становится стеклянной только в варианте floating.
      sidebarVariant={theme.style === "glass" ? "floating" : "sidebar"}
      navbar={
        <Navbar maxWidth="full">
          <Navbar.Header>
            <AppLayout.MenuToggle />
            <Sidebar.Trigger />
            <Breadcrumbs className="min-w-0">
              {breadcrumbs.map((label, index) => (
                <Breadcrumbs.Item
                  key={label}
                  className={index === breadcrumbs.length - 1 ? "font-semibold" : "text-muted"}
                >
                  {label}
                </Breadcrumbs.Item>
              ))}
            </Breadcrumbs>
            <Navbar.Spacer />
            <ThemeSwitcher theme={theme} onChange={onThemeChange} />
          </Navbar.Header>
        </Navbar>
      }
      scrollMode="content"
      sidebar={
        <>
          <Sidebar>
            <Sidebar.Header>
              <Brand />
            </Sidebar.Header>
            <Sidebar.Content>
              <NavMenu counters={counters} path={path} />
            </Sidebar.Content>
            <Sidebar.Footer className="px-2 pt-0 pb-2">
              <UserMenu />
            </Sidebar.Footer>
            <Sidebar.Rail />
          </Sidebar>
          <Sidebar.Mobile>
            <Sidebar.Header>
              <Brand />
            </Sidebar.Header>
            <Sidebar.Content>
              <NavMenu counters={counters} path={path} />
            </Sidebar.Content>
            <Sidebar.Footer className="px-2 pt-0 pb-2">
              <UserMenu />
            </Sidebar.Footer>
          </Sidebar.Mobile>
        </>
      }
    >
      {children}
    </AppLayout>
  );
}
