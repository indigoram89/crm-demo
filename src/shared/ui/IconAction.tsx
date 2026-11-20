import type {ReactNode} from "react";

import {Button, Tooltip} from "@heroui/react";

type Props = {
  label: string;
  children: ReactNode;
  onPress?: () => void;
  isDisabled?: boolean;
  slot?: string;
};

/** Кнопка-иконка с обязательной подсказкой: так её поймут и мышью, и со скринридером. */
export function IconAction({label, children, onPress, isDisabled, slot}: Props) {
  return (
    <Tooltip delay={300}>
      <Button
        isIconOnly
        aria-label={label}
        isDisabled={isDisabled}
        size="sm"
        slot={slot}
        variant="ghost"
        onPress={onPress}
      >
        {children}
      </Button>
      <Tooltip.Content>
        <p>{label}</p>
      </Tooltip.Content>
    </Tooltip>
  );
}
