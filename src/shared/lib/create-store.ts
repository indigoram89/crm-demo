import {useSyncExternalStore} from "react";

/** Маленькое хранилище без зависимостей: get, set и React-хук. */
export function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();

  const get = () => state;

  const set = (update: T | ((prev: T) => T)) => {
    state = typeof update === "function" ? (update as (prev: T) => T)(state) : update;
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);

    return () => listeners.delete(listener);
  };

  const useStore = () => useSyncExternalStore(subscribe, get);

  return {get, set, useStore};
}
