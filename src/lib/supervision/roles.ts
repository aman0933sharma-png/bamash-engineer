import type { Structure, View } from "@/lib/supervision/types";

export const DESIGNATIONS = [
  "Bridge Engineer",
  "Highway Engineer",
  "Site Engineer",
  "Quality Engineer",
  "Safety Officer",
  "Quantity Surveyor",
] as const;

export type Designation = (typeof DESIGNATIONS)[number];

export function isDesignation(value: string): value is Designation {
  return (DESIGNATIONS as readonly string[]).includes(value);
}

const PAVEMENT = new Set(["ew", "sg", "gsb", "wmm", "dbm", "bc", "re"]);
const BRIDGE_ITEMS = new Set(["rcc", "stl", "pl"]);

export function isBridgeStructure(item: Pick<Structure, "id" | "name" | "short">): boolean {
  if (item.id.startsWith("br-")) return true;
  return /bridge|culvert|underpass|girder|pier/i.test(`${item.name} ${item.short}`);
}

export function boqIdsFor(role: Designation): Set<string> | null {
  if (role === "Highway Engineer") return PAVEMENT;
  if (role === "Bridge Engineer") return BRIDGE_ITEMS;
  if (role === "Quantity Surveyor") return null;
  return new Set();
}

export function navFor(role: Designation): { id: View; label: string }[] {
  const desk = { id: "desk" as const, label: "Desk" };
  switch (role) {
    case "Bridge Engineer":
      return [desk, { id: "bridge", label: "Bridges" }];
    case "Highway Engineer":
      return [desk, { id: "measure", label: "Layers" }];
    case "Site Engineer":
      return [desk, { id: "diary", label: "Diary" }];
    case "Quality Engineer":
      return [desk, { id: "inspect", label: "RFIs" }, { id: "ncr", label: "NCRs" }];
    case "Safety Officer":
      return [desk, { id: "safety", label: "Safety" }];
    case "Quantity Surveyor":
      return [desk, { id: "measure", label: "Qty" }];
  }
}

export const ROLE_NOTE: Record<Designation, string> = {
  "Bridge Engineer": "Bridges, culverts and underpasses on this package. Add a member when work starts.",
  "Highway Engineer": "Embankment and pavement layers. Record a quantity and the layer progress moves.",
  "Site Engineer": "Daily site diary — weather, labour, plant and the work done today.",
  "Quality Engineer": "Hold points and non-conformances. Raise an RFI or an NCR from here.",
  "Safety Officer": "Open hazards on the package. Log what you saw and close it when it is made safe.",
  "Quantity Surveyor": "The measurement book for every bill item. A new entry updates executed quantity.",
};
