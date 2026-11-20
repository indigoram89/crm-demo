export type Employee = {
  id: string;
  name: string;
  email: string;
  position: string;
  initials: string;
};

const person = (id: string, name: string, email: string, position: string): Employee => ({
  id,
  name,
  email,
  position,
  initials: name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join(""),
});

export const employees: Employee[] = [
  person("1", "Ким Виктория Сергеевна", "kim@okna.example", "Руководитель продаж"),
  person("2", "Иванова Мария Сергеевна", "ivanova@okna.example", "Менеджер"),
  person("3", "Козлов Дмитрий Олегович", "kozlov@okna.example", "Менеджер"),
  person("4", "Морозова Елена Игоревна", "morozova@okna.example", "Менеджер"),
  person("5", "Соколов Андрей Павлович", "sokolov@okna.example", "Замерщик"),
  person("6", "Петров Кирилл Андреевич", "petrov@okna.example", "Замерщик"),
  person("7", "Бекова Мадина Ерлановна", "bekova@okna.example", "Бухгалтер"),
];

export const employee_groups = Object.entries(Object.groupBy(employees, (employee) => employee.position)).map(
  ([position, items]) => ({position, items: items ?? []}),
);

export const UNASSIGNED = "unassigned";

export const findEmployee = (id: string) => employees.find((employee) => employee.id === id);
