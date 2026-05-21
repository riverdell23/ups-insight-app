export type CompareRowDef = {
  label: string;
  getValue: (p: Record<string, unknown>) => unknown;
};

export const COMPARE_ROWS: CompareRowDef[] = [
  { label: "Vendor", getValue: (p) => (p.vendors as { name?: string })?.name },
  { label: "Topology", getValue: (p) => p.topology },
  { label: "Architecture", getValue: (p) => p.modular_type },
  { label: "Min capacity (kW)", getValue: (p) => p.min_capacity_kw },
  { label: "Max capacity (kW)", getValue: (p) => p.max_capacity_kw },
  { label: "Max parallel (kW)", getValue: (p) => p.max_parallel_kw },
  { label: "Double-conv. efficiency %", getValue: (p) => p.double_conversion_efficiency },
  { label: "Eco-mode efficiency %", getValue: (p) => p.eco_mode_efficiency },
  { label: "Battery type", getValue: (p) => p.battery_type },
  { label: "Footprint m²", getValue: (p) => p.footprint_area_m2 },
  { label: "Power density kW/m²", getValue: (p) => p.power_density_kw_per_m2 },
  { label: "Access requirement", getValue: (p) => p.access_requirement },
  { label: "Monitoring", getValue: (p) => p.monitoring_protocol },
  { label: "Region (summary)", getValue: (p) => p.region_availability },
  { label: "Region (detail)", getValue: (p) => p.region_availability_detail },
  { label: "Verification", getValue: (p) => p.verification_status },
  { label: "Last verified", getValue: (p) => p.last_verified_date },
  {
    label: "Last verified by",
    getValue: (p) => {
      const v = p.verifier as { full_name?: string; email?: string } | null | undefined;
      return v?.full_name || v?.email || null;
    },
  },
];

function escapeCsvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function buildCompareCsv(
  products: Record<string, unknown>[],
  rows: CompareRowDef[] = COMPARE_ROWS,
): string {
  const header = ["Spec", ...products.map((p) => `${(p.vendors as { name?: string })?.name ?? ""} — ${p.product_series ?? ""}`)];
  const lines = [header.map(escapeCsvCell).join(",")];
  for (const row of rows) {
    lines.push(
      [row.label, ...products.map((p) => row.getValue(p) ?? "")].map(escapeCsvCell).join(","),
    );
  }
  return lines.join("\r\n");
}

export function downloadCompareCsv(products: Record<string, unknown>[]) {
  const csv = "\uFEFF" + buildCompareCsv(products);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ups-compare-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
