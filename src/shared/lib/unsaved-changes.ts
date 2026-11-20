import {toast} from "@heroui/react";
import {useEffect} from "react";

const dirty_forms = new Set<symbol>();

export const hasUnsavedChanges = () => dirty_forms.size > 0;

export function warnUnsavedChanges() {
  toast.warning("Есть несохранённые изменения", {description: "Сохраните их или нажмите «Отменить»"});
}

/** Форма сообщает, что в ней есть несохранённые правки: тогда уход со страницы блокируется. */
export function useUnsavedChanges(is_dirty: boolean) {
  useEffect(() => {
    if (!is_dirty) return;

    const token = Symbol("dirty-form");
    const handleBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();

    dirty_forms.add(token);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      dirty_forms.delete(token);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [is_dirty]);
}
