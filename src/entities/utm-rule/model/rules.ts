import type {Lead, UtmField} from "@/entities/lead";

import {createStore} from "@/shared/lib/create-store";

export type Condition = "equals" | "contains";

export type UtmRule = {
  id: string;
  field: UtmField;
  condition: Condition;
  value: string;
  source_id: string | null;
  is_enabled: boolean;
};

export const condition_labels: Record<Condition, string> = {equals: "равно", contains: "содержит"};

const initial: UtmRule[] = [
  {
    id: "r1",
    field: "utm_campaign",
    condition: "equals",
    value: "okna_almaty_brand",
    source_id: "google",
    is_enabled: true,
  },
  {id: "r2", field: "utm_source", condition: "contains", value: "google", source_id: "google", is_enabled: true},
  {id: "r3", field: "utm_source", condition: "equals", value: "2gis", source_id: "2gis", is_enabled: true},
  {id: "r4", field: "utm_source", condition: "equals", value: "instagram", source_id: "instagram", is_enabled: true},
  {
    id: "r5",
    field: "referrer",
    condition: "contains",
    value: "instagram.com",
    source_id: "instagram",
    is_enabled: true,
  },
  {id: "r6", field: "landing", condition: "contains", value: "/2gis", source_id: "2gis", is_enabled: true},
];

const store = createStore(initial);

export const useRules = store.useStore;
export const saveRules = store.set;

const matches = (rule: UtmRule, lead: Lead) => {
  const actual = lead.utm[rule.field]?.toLocaleLowerCase();
  const expected = rule.value.trim().toLocaleLowerCase();

  if (!actual || !expected || !rule.source_id || !rule.is_enabled) return false;

  return rule.condition === "equals" ? actual === expected : actual.includes(expected);
};

/**
 * Для каждой заявки без источника находит первое подходящее правило (правила идут по порядку).
 * Возвращает, какой источник поставить какой заявке, и сколько заявок «забрало» каждое правило.
 */
export function matchLeads(rules: UtmRule[], leads: Lead[]) {
  const assignments = new Map<number, string>();
  const per_rule = new Map<string, number>();
  let unmatched = 0;

  for (const lead of leads) {
    if (lead.source_id) continue;

    const rule = rules.find((entry) => matches(entry, lead));

    if (!rule?.source_id) {
      unmatched += 1;
      continue;
    }

    assignments.set(lead.id, rule.source_id);
    per_rule.set(rule.id, (per_rule.get(rule.id) ?? 0) + 1);
  }

  return {assignments, per_rule, unmatched};
}

/** Пришедшие метки, под которые не подошло ни одно правило: подсказка, какие правила добавить. */
export function getUnmatchedTags(rules: UtmRule[], leads: Lead[]) {
  const tags = new Map<string, {field: UtmField; value: string; count: number}>();

  for (const lead of leads) {
    if (rules.some((rule) => matches(rule, lead))) continue;

    for (const [field, value] of Object.entries(lead.utm) as [UtmField, string][]) {
      const key = `${field}=${value}`;
      const tag = tags.get(key) ?? {field, value, count: 0};

      tags.set(key, {...tag, count: tag.count + 1});
    }
  }

  return [...tags.values()].sort((a, b) => b.count - a.count);
}
