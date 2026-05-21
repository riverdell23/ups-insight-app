export const VERIFICATION_STATUSES = [
  "Draft",
  "Pending Review",
  "Verified",
  "Vendor Submitted",
  "Outdated Risk",
  "Discontinued",
  "Region Check Required",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

/** Primary admin save actions in product dialogs */
export const ADMIN_SAVE_STATUSES = ["Draft", "Pending Review", "Verified"] as const;
export type AdminSaveStatus = (typeof ADMIN_SAVE_STATUSES)[number];

export const SOURCE_TYPES = [
  "Datasheet",
  "Product brochure",
  "Web page",
  "Vendor submission",
  "Third-party review",
  "Other",
] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export function verificationBadgeClass(s: string) {
  switch (s) {
    case "Draft":
      return "bg-muted text-muted-foreground border-border";
    case "Verified":
      return "bg-success/15 text-success border-success/30";
    case "Pending Review":
      return "bg-warning/15 text-warning-foreground border-warning/30";
    case "Vendor Submitted":
      return "bg-info/15 text-info border-info/30";
    case "Outdated Risk":
      return "bg-destructive/15 text-destructive border-destructive/30";
    case "Discontinued":
      return "bg-muted text-muted-foreground border-border";
    case "Region Check Required":
      return "bg-accent/15 text-accent border-accent/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function verificationSideEffects(
  status: AdminSaveStatus | VerificationStatus,
  userId: string | null,
): {
  last_verified_date: string | null;
  last_verified_by: string | null;
} {
  if (status === "Verified" && userId) {
    return {
      last_verified_date: new Date().toISOString().slice(0, 10),
      last_verified_by: userId,
    };
  }
  return { last_verified_date: null, last_verified_by: null };
}

export const DISCLAIMER =
  "This app is for preliminary product benchmarking and consultant reference only. Final selection shall be verified against certified vendor data, project requirements, local regulations, and professional engineering judgement.";
