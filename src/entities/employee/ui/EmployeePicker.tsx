import type {Key} from "@heroui/react";

import {
  Autocomplete,
  Avatar,
  Description,
  EmptyState,
  Header,
  Label,
  ListBox,
  SearchField,
  Separator,
  useFilter,
} from "@heroui/react";
import {Fragment} from "react";

import {type Employee, UNASSIGNED, employee_groups, findEmployee} from "../model/employees";

function EmployeeAvatar({employee, className}: {employee: Employee; className?: string}) {
  return (
    <Avatar className={className} size="sm" variant="soft">
      <Avatar.Fallback>{employee.initials}</Avatar.Fallback>
    </Avatar>
  );
}

function UnassignedAvatar({className = ""}: {className?: string}) {
  return (
    <Avatar className={`border border-dashed border-border bg-transparent ${className}`} size="sm">
      <Avatar.Fallback className="bg-transparent text-muted">?</Avatar.Fallback>
    </Avatar>
  );
}

type Props = {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  variant?: "primary" | "secondary";
};

/** Выбор сотрудника: поиск по имени, должности и почте, группы по должностям, «Не назначен». */
export function EmployeePicker({label, value, onChange, variant}: Props) {
  const {contains} = useFilter({sensitivity: "base"});

  return (
    <Autocomplete
      fullWidth
      placeholder="Выберите сотрудника"
      selectionMode="single"
      value={value ?? UNASSIGNED}
      variant={variant}
      onChange={(key: Key | Key[] | null) => onChange(key === null || key === UNASSIGNED ? null : String(key))}
    >
      <Label>{label}</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value>
          {({defaultChildren, isPlaceholder, state}) => {
            const key = state.selectedItems[0]?.key;
            const employee = key ? findEmployee(String(key)) : undefined;

            if (isPlaceholder || key === undefined) return defaultChildren;

            if (!employee) {
              return (
                <span className="flex items-center gap-2 text-muted">
                  <UnassignedAvatar className="size-6" />
                  Не назначен
                </span>
              );
            }

            return (
              <span className="flex min-w-0 items-center gap-2">
                <EmployeeAvatar className="size-6 shrink-0 text-[10px]" employee={employee} />
                <span className="truncate">{employee.name}</span>
                <span className="ms-auto shrink-0 ps-2 text-xs text-muted">{employee.position}</span>
              </span>
            );
          }}
        </Autocomplete.Value>
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField autoFocus aria-label="Найти сотрудника" name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Имя, должность или почта" />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox
            className="max-h-80 overflow-y-auto"
            renderEmptyState={() => <EmptyState>Никого не нашли</EmptyState>}
          >
            <ListBox.Item id={UNASSIGNED} textValue="Не назначен">
              <UnassignedAvatar />
              <Label>Не назначен</Label>
              <ListBox.ItemIndicator />
            </ListBox.Item>
            {employee_groups.map((group) => (
              <Fragment key={group.position}>
                <Separator />
                <ListBox.Section>
                  <Header>{group.position}</Header>
                  {group.items.map((employee) => (
                    <ListBox.Item
                      key={employee.id}
                      id={employee.id}
                      textValue={`${employee.name} ${employee.position} ${employee.email}`}
                    >
                      <EmployeeAvatar employee={employee} />
                      <div className="flex min-w-0 flex-col">
                        <Label className="truncate">{employee.name}</Label>
                        <Description>{employee.email}</Description>
                      </div>
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox.Section>
              </Fragment>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}
