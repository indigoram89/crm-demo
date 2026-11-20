const money = new Intl.NumberFormat("ru-RU", {maximumFractionDigits: 0});

export const formatMoney = (value: number) => `${money.format(value)} ₸`;

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("ru-RU", {dateStyle: "short", timeStyle: "short"}).format(new Date(iso));

let id_counter = 0;

/** crypto.randomUUID есть только в secure context (https, localhost). Иначе — простой уникальный id. */
export const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now().toString(36)}-${(id_counter += 1)}`;
