import {toast} from "@heroui/react";

/** Копирует текст и сообщает результат. Clipboard API есть только в secure context (https, localhost). */
export async function copyText(text: string, success_message: string) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard API недоступен");

    await navigator.clipboard.writeText(text);
    toast.success(success_message);
  } catch {
    toast.danger("Не удалось скопировать", {description: "Выделите текст и скопируйте вручную"});
  }
}
