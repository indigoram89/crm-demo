import type {DirectoryId} from "@/entities/directory";
import type {Lead} from "@/entities/lead";
import type {UtmRule} from "@/entities/utm-rule";

/** Где значения справочника реально используются: в заявках и (для источников) в UTM-правилах. */
export function countUsage(id: DirectoryId, leads: Lead[], rules: UtmRule[]): Map<string, number> {
  const usage = new Map<string, number>();
  const add = (value: string | null | undefined) => {
    if (value) usage.set(value, (usage.get(value) ?? 0) + 1);
  };

  for (const lead of leads) {
    if (id === "channels") add(lead.channel_id);
    if (id === "sources") add(lead.source_id);
    if (id === "object_types") add(lead.object?.type_id);
    if (id === "units") lead.needs.forEach((need) => add(need.unit_id));
  }

  if (id === "sources") rules.forEach((rule) => add(rule.source_id));

  return usage;
}
