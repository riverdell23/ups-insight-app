import type { Json } from "@/integrations/supabase/types";
import { PRODUCT_FIELD_KEYS } from "@/lib/product-fields";
import type { AdminSaveStatus } from "@/lib/ups";
import { verificationSideEffects } from "@/lib/ups";

export type FieldChange = { from: unknown; to: unknown };
export type ChangesRecord = Record<string, FieldChange>;

const DIFF_KEYS = [...PRODUCT_FIELD_KEYS, "verification_status"];

function serializeValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

export function diffProductRecords(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): { changes: ChangesRecord; summary: string } {
  const changes: ChangesRecord = {};
  const parts: string[] = [];

  for (const key of DIFF_KEYS) {
    const fromVal = before[key] ?? null;
    const toVal = after[key] ?? null;
    if (serializeValue(fromVal) === serializeValue(toVal)) continue;
    changes[key] = { from: fromVal, to: toVal };
    parts.push(`${key} ${serializeValue(fromVal)} → ${serializeValue(toVal)}`);
  }

  const series = String(after.product_series ?? before.product_series ?? "product");
  const summary =
    parts.length > 0
      ? `Edited ${series}: ${parts.join("; ")}`
      : `Edited ${series}: no field changes`;

  return { changes, summary };
}

export function formatChangesForDisplay(changes: Json | ChangesRecord | null): string {
  if (!changes || typeof changes !== "object" || Array.isArray(changes)) return "";
  const lines: string[] = [];
  for (const [key, val] of Object.entries(changes as ChangesRecord)) {
    if (val && typeof val === "object" && "from" in val && "to" in val) {
      lines.push(`${key}: ${serializeValue(val.from)} → ${serializeValue(val.to)}`);
    }
  }
  return lines.join("\n");
}

export function buildProductUpdatePayload(
  formData: Record<string, unknown>,
  saveStatus: AdminSaveStatus,
  userId: string | null,
): Record<string, unknown> {
  const sideEffects = verificationSideEffects(saveStatus, userId);
  return {
    ...formData,
    verification_status: saveStatus,
    ...sideEffects,
  };
}

export function changesToJson(changes: ChangesRecord): Json {
  return changes as Json;
}
