export type ProductFieldDef = {
  key: string;
  label: string;
  type?: "number" | "text" | "textarea";
};

export const PRODUCT_FIELDS: ProductFieldDef[] = [
  { key: "product_series", label: "Product series" },
  { key: "topology", label: "Topology" },
  { key: "modular_type", label: "Modular type (Modular/Monolithic)" },
  { key: "min_capacity_kw", label: "Min capacity (kW)", type: "number" },
  { key: "max_capacity_kw", label: "Max capacity (kW)", type: "number" },
  { key: "max_parallel_kw", label: "Max parallel (kW)", type: "number" },
  { key: "double_conversion_efficiency", label: "Double-conversion efficiency %", type: "number" },
  { key: "eco_mode_efficiency", label: "Eco-mode efficiency %", type: "number" },
  { key: "battery_type", label: "Battery type" },
  { key: "footprint_area_m2", label: "Footprint (m²)", type: "number" },
  { key: "power_density_kw_per_m2", label: "Power density (kW/m²)", type: "number" },
  { key: "access_requirement", label: "Access requirement" },
  { key: "monitoring_protocol", label: "Monitoring protocol" },
  { key: "region_availability", label: "Region availability (summary)" },
  { key: "region_availability_detail", label: "Region availability (detail)", type: "textarea" },
  { key: "verification_notes", label: "Verification notes", type: "textarea" },
];

export const PRODUCT_FIELD_KEYS = PRODUCT_FIELDS.map((f) => f.key);

export function normalizeProductValue(
  field: ProductFieldDef,
  raw: unknown,
): string | number | null {
  if (raw === "" || raw === undefined || raw === null) return null;
  if (field.type === "number") {
    const n = Number(raw);
    return Number.isNaN(n) ? null : n;
  }
  return String(raw);
}

export function buildProductPayload(
  data: Record<string, unknown>,
): Record<string, string | number | null> {
  const payload: Record<string, string | number | null> = {};
  for (const field of PRODUCT_FIELDS) {
    if (data[field.key] !== undefined) {
      payload[field.key] = normalizeProductValue(field, data[field.key]);
    }
  }
  return payload;
}

export function snapshotProductForDiff(
  record: Record<string, unknown>,
): Record<string, unknown> {
  const snap: Record<string, unknown> = {};
  for (const key of PRODUCT_FIELD_KEYS) {
    snap[key] = record[key] ?? null;
  }
  snap.verification_status = record.verification_status ?? null;
  return snap;
}

export type PrimarySourceForm = {
  id?: string;
  title: string;
  url: string;
  source_type: string;
  datasheet_date: string;
  retrieved_date: string;
};

export const EMPTY_PRIMARY_SOURCE: PrimarySourceForm = {
  title: "",
  url: "",
  source_type: "Datasheet",
  datasheet_date: "",
  retrieved_date: "",
};
