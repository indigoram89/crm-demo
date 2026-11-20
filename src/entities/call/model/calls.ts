export type CallResult = "active" | "answered" | "missed" | "rejected";

export type Call = {
  id: string;
  started_at: string;
  phone: string;
  /** Имя контакта; null — номер не найден в базе. */
  contact: string | null;
  is_spam: boolean;
  result: CallResult;
  decision: string | null;
  routed_to: "Ответственному" | "Всем" | "Отсечён";
  answered_by: string | null;
  duration_sec: number;
  lead_id: number | null;
  has_record: boolean;
  tracking: string | null;
};

export const call_results: Record<CallResult, {label: string; color: "accent" | "success" | "danger" | "default"}> = {
  active: {label: "Идёт", color: "accent"},
  answered: {label: "Отвечен", color: "success"},
  missed: {label: "Пропущен", color: "danger"},
  rejected: {label: "Отсечён", color: "default"},
};

const contacts = ["Жумабаева Дана", "ТОО «Алматы Строй Сервис»", "Ахметов Руслан", null, "Смирнова Елена", "Ким Денис"];
const operators = ["Ким Виктория", "Иванова Мария", "Козлов Дмитрий", "Морозова Елена"];
const trackings = ["Google", "2ГИС", "Instagram", null, "Яндекс"];
const results: CallResult[] = ["answered", "answered", "missed", "answered", "rejected", "answered", "missed"];

/** Детерминированные демо-данные: одинаковые при каждой загрузке, чтобы демо было предсказуемым. */
function generateCalls(count: number): Call[] {
  const start = new Date("2026-11-19T18:40:00").getTime();

  return Array.from({length: count}, (_, index) => {
    const contact = contacts[index % contacts.length] ?? null;
    const is_spam = contact === null && index % 4 === 0;
    // Спам отсекается до разговора: итог «Отсечён», без ответившего, длительности и записи.
    const result: CallResult = is_spam ? "rejected" : index === 0 ? "active" : results[index % results.length]!;
    const is_missed = result === "missed";

    return {
      id: `call-${index + 1}`,
      started_at: new Date(start - index * 97 * 60 * 1000).toISOString(),
      phone: `+7 (7${(index * 7) % 10}${index % 10}) ${String(200 + ((index * 37) % 700)).padStart(3, "0")}-${String(10 + ((index * 13) % 89)).padStart(2, "0")}-${String(10 + ((index * 29) % 89)).padStart(2, "0")}`,
      contact,
      is_spam,
      result,
      decision: is_missed && index % 3 === 0 ? "Поставлена задача" : null,
      routed_to: is_spam ? "Отсечён" : index % 2 ? "Всем" : "Ответственному",
      answered_by: result === "answered" ? operators[index % operators.length]! : null,
      duration_sec: result === "answered" ? 40 + ((index * 53) % 600) : 0,
      lead_id: contact === "Смирнова Елена" ? 441 : contact === "Ахметов Руслан" ? 440 : null,
      has_record: result === "answered",
      tracking: trackings[index % trackings.length] ?? null,
    };
  });
}

export const calls = generateCalls(63);

export const formatDuration = (seconds: number) =>
  seconds ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}` : "—";
