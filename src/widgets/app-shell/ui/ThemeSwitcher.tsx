import type {Selection} from "@heroui/react";

import {Moon, Palette, Sun} from "@gravity-ui/icons";
import {Button, Description, Dropdown, Header, Label, Tooltip} from "@heroui/react";
import {Segment} from "@heroui-pro/react/segment";

import {type Theme, type ThemeMode, type ThemeStyle, theme_styles} from "@/shared/lib/theme";

type Props = {
  theme: Theme;
  onChange: (theme: Theme) => void;
};

/** Стиль (готовые темы HeroUI Pro) и светлый/тёмный режим. */
export function ThemeSwitcher({theme, onChange}: Props) {
  return (
    <div className="flex items-center gap-2">
      <Dropdown>
        <Tooltip delay={300}>
          <Button isIconOnly aria-label="Стиль оформления" variant="ghost">
            <Palette className="size-4" />
          </Button>
          <Tooltip.Content>
            <p>Стиль оформления</p>
          </Tooltip.Content>
        </Tooltip>
        <Dropdown.Popover className="min-w-64" placement="bottom end">
          <Dropdown.Menu
            aria-label="Стиль оформления"
            disallowEmptySelection
            selectedKeys={new Set([theme.style])}
            selectionMode="single"
            onSelectionChange={(keys: Selection) => {
              const [style] = [...(keys as Set<ThemeStyle>)];

              if (style) onChange({...theme, style});
            }}
          >
            <Dropdown.Section>
              <Header>Темы HeroUI Pro</Header>
              {theme_styles.map((style) => (
                <Dropdown.Item key={style.id} id={style.id} textValue={style.label}>
                  <Dropdown.ItemIndicator />
                  <div className="flex flex-col">
                    <Label>{style.label}</Label>
                    <Description>{style.description}</Description>
                  </div>
                </Dropdown.Item>
              ))}
            </Dropdown.Section>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>

      <Segment
        aria-label="Светлая или тёмная тема"
        selectedKey={theme.mode}
        size="sm"
        onSelectionChange={(key) => onChange({...theme, mode: key as ThemeMode})}
      >
        <Segment.Item aria-label="Светлая тема" id="light">
          <Sun className="size-4" />
        </Segment.Item>
        <Segment.Item aria-label="Тёмная тема" id="dark">
          <Moon className="size-4" />
        </Segment.Item>
      </Segment>
    </div>
  );
}
