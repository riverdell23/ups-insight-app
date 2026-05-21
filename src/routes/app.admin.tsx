import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Shield, Plus, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import {
  VERIFICATION_STATUSES,
  SOURCE_TYPES,
  verificationBadgeClass,
  verificationSideEffects,
  type AdminSaveStatus,
} from "@/lib/ups";
import {
  PRODUCT_FIELDS,
  buildProductPayload,
  snapshotProductForDiff,
  EMPTY_PRIMARY_SOURCE,
  type PrimarySourceForm,
  type ProductFieldDef,
} from "@/lib/product-fields";
import {
  diffProductRecords,
  formatChangesForDisplay,
  buildProductUpdatePayload,
  changesToJson,
} from "@/lib/product-changelog";

export const Route = createFileRoute("/app/admin")({ component: AdminPage });

type ProductRow = Record<string, unknown> & {
  id: string;
  product_series: string;
  verification_status: string;
  vendors?: { name: string } | null;
  verifier?: { full_name: string | null; email: string | null } | null;
};

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const qc = useQueryClient();

  const { data: vendors } = useQuery({
    queryKey: ["admin-vendors"],
    queryFn: async () => (await supabase.from("vendors").select("*").order("name")).data ?? [],
  });
  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () =>
      (
        await supabase
          .from("ups_products")
          .select("*, vendors(name), verifier:profiles!ups_products_last_verified_by_fkey(full_name, email)")
          .order("product_series")
      ).data ?? [],
  });
  const { data: logs } = useQuery({
    queryKey: ["admin-logs"],
    queryFn: async () =>
      (await supabase.from("change_logs").select("*").order("created_at", { ascending: false }).limit(50)).data ?? [],
    enabled: !!isAdmin,
  });

  const logProductChange = async (
    action: string,
    details: string,
    productId: string | undefined,
    changes: ReturnType<typeof diffProductRecords>["changes"] | null,
  ) => {
    await supabase.from("change_logs").insert({
      action,
      details,
      product_id: productId ?? null,
      user_id: user!.id,
      changes: changes && Object.keys(changes).length > 0 ? changesToJson(changes) : null,
    });
  };

  const applyStatusUpdate = async (product: ProductRow, status: string) => {
    const sideEffects = verificationSideEffects(status, user!.id);
    const before = snapshotProductForDiff(product);
    const { error } = await supabase
      .from("ups_products")
      .update({ verification_status: status as never, ...sideEffects })
      .eq("id", product.id);
    if (error) return toast.error(error.message);
    const after = { ...before, verification_status: status, ...sideEffects };
    const { changes, summary } = diffProductRecords(before, after);
    await logProductChange("status_change", summary, product.id, changes);
    toast.success("Status updated");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["admin-logs"] });
  };

  if (loading) return <div className="text-muted-foreground">Loading…</div>;

  if (!isAdmin) {
    return (
      <Card className="max-w-xl p-8">
        <ShieldOff className="h-8 w-8 text-warning" />
        <h1 className="font-display text-2xl font-bold mt-4">Admin access required</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Your account does not have admin privileges. To bootstrap the first admin, run this in the backend SQL editor:
        </p>
        <pre className="mt-4 text-xs font-mono bg-muted p-3 rounded overflow-auto">{`INSERT INTO public.user_roles (user_id, role)\nVALUES ('${user?.id ?? "<your user id>"}', 'admin');`}</pre>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="font-display text-3xl font-bold flex items-center gap-2">
          <Shield className="h-7 w-7 text-accent" /> Admin Console
        </h1>
        <p className="text-muted-foreground mt-1">Manage vendors, products, sources and verification status.</p>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="logs">Change Log</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <AddProductDialog
              vendors={vendors ?? []}
              userId={user!.id}
              onCreated={async (productId, summary, changes) => {
                await logProductChange("create_product", summary, productId, changes);
                qc.invalidateQueries({ queryKey: ["admin-products"] });
                qc.invalidateQueries({ queryKey: ["admin-logs"] });
              }}
            />
          </div>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Vendor / Series</th>
                  <th className="text-right p-3">Max kW</th>
                  <th className="text-right p-3">Eff %</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Last verified</th>
                  <th className="text-left p-3">Verified by</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {(products as ProductRow[] | undefined)?.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="p-3">
                      {p.vendors?.name} · <span className="text-muted-foreground">{p.product_series}</span>
                    </td>
                    <td className="p-3 text-right font-mono">{String(p.max_capacity_kw ?? "")}</td>
                    <td className="p-3 text-right font-mono">{String(p.double_conversion_efficiency ?? "")}</td>
                    <td className="p-3">
                      <Select value={p.verification_status} onValueChange={(v) => applyStatusUpdate(p, v)}>
                        <SelectTrigger className="h-8 w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VERIFICATION_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3 font-mono text-xs">{String(p.last_verified_date ?? "")}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {p.verifier?.full_name || p.verifier?.email || "—"}
                    </td>
                    <td className="p-3">
                      <EditProductDialog
                        product={p}
                        userId={user!.id}
                        onSaved={async (summary, changes, productId) => {
                          await logProductChange("edit_product", summary, productId, changes);
                          qc.invalidateQueries({ queryKey: ["admin-products"] });
                          qc.invalidateQueries({ queryKey: ["admin-logs"] });
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <AddVendorDialog onCreated={() => qc.invalidateQueries({ queryKey: ["admin-vendors"] })} />
          </div>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Country</th>
                  <th className="text-left p-3">Website</th>
                </tr>
              </thead>
              <tbody>
                {vendors?.map((v) => (
                  <tr key={v.id} className="border-t border-border">
                    <td className="p-3 font-medium">{v.name}</td>
                    <td className="p-3">{v.country}</td>
                    <td className="p-3">
                      <a href={v.website ?? "#"} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                        {v.website}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left p-3">When</th>
                  <th className="text-left p-3">Action</th>
                  <th className="text-left p-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs?.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-muted-foreground">
                      No change log entries yet.
                    </td>
                  </tr>
                )}
                {logs?.map((l) => {
                  const diffText = formatChangesForDisplay(l.changes);
                  return (
                    <tr key={l.id} className="border-t border-border align-top">
                      <td className="p-3 font-mono text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                      <td className="p-3">
                        <Badge variant="outline">{l.action}</Badge>
                      </td>
                      <td className="p-3">
                        <div>{l.details}</div>
                        {diffText && (
                          <pre className="mt-2 text-[11px] font-mono text-muted-foreground bg-muted/50 p-2 rounded whitespace-pre-wrap">
                            {diffText}
                          </pre>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AddVendorDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", country: "", website: "" });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add vendor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add vendor</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Country</Label>
            <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
          <div>
            <Label>Website</Label>
            <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={async () => {
              const { error } = await supabase.from("vendors").insert(form);
              if (error) return toast.error(error.message);
              toast.success("Vendor added");
              setOpen(false);
              setForm({ name: "", country: "", website: "" });
              onCreated();
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProductFieldGrid({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PRODUCT_FIELDS.map((f) => (
        <ProductFieldInput key={f.key} field={f} value={String(data[f.key] ?? "")} onChange={(v) => onChange(f.key, v)} />
      ))}
    </div>
  );
}

function ProductFieldInput({
  field,
  value,
  onChange,
}: {
  field: ProductFieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={field.type === "textarea" ? "col-span-2" : ""}>
      <Label>{field.label}</Label>
      {field.type === "textarea" ? (
        <Textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input type={field.type === "number" ? "number" : "text"} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function PrimarySourceFields({
  source,
  onChange,
}: {
  source: PrimarySourceForm;
  onChange: (s: PrimarySourceForm) => void;
}) {
  return (
    <div className="space-y-3 border-t border-border pt-4 mt-2">
      <h3 className="text-sm font-semibold">Primary documentation source</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>Title</Label>
          <Input value={source.title} onChange={(e) => onChange({ ...source, title: e.target.value })} placeholder="e.g. Product datasheet Rev C" />
        </div>
        <div className="col-span-2">
          <Label>URL</Label>
          <Input value={source.url} onChange={(e) => onChange({ ...source, url: e.target.value })} placeholder="https://…" />
        </div>
        <div>
          <Label>Source type</Label>
          <Select value={source.source_type} onValueChange={(v) => onChange({ ...source, source_type: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Datasheet date</Label>
          <Input type="date" value={source.datasheet_date} onChange={(e) => onChange({ ...source, datasheet_date: e.target.value })} />
        </div>
        <div>
          <Label>Retrieved date</Label>
          <Input type="date" value={source.retrieved_date} onChange={(e) => onChange({ ...source, retrieved_date: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

function SaveWorkflowFooter({
  saving,
  onSave,
}: {
  saving: boolean;
  onSave: (status: AdminSaveStatus) => void;
}) {
  return (
    <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-end">
      <Button type="button" variant="outline" disabled={saving} onClick={() => onSave("Draft")}>
        Save as Draft
      </Button>
      <Button type="button" variant="secondary" disabled={saving} onClick={() => onSave("Pending Review")}>
        Submit for Pending Review
      </Button>
      <Button type="button" disabled={saving} onClick={() => onSave("Verified")}>
        Mark as Verified
      </Button>
    </DialogFooter>
  );
}

async function upsertPrimarySource(productId: string, source: PrimarySourceForm) {
  if (!source.title.trim()) return;
  const row = {
    product_id: productId,
    title: source.title.trim(),
    url: source.url.trim() || null,
    source_type: source.source_type || null,
    datasheet_date: source.datasheet_date || null,
    retrieved_date: source.retrieved_date || null,
  };
  if (source.id) {
    await supabase.from("sources").update(row).eq("id", source.id);
  } else {
    await supabase.from("sources").insert(row);
  }
}

function AddProductDialog({
  vendors,
  userId,
  onCreated,
}: {
  vendors: { id: string; name: string }[];
  userId: string;
  onCreated: (productId: string, summary: string, changes: ReturnType<typeof diffProductRecords>["changes"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [vendor_id, setVendor] = useState("");
  const [data, setData] = useState<Record<string, unknown>>({});
  const [source, setSource] = useState<PrimarySourceForm>({ ...EMPTY_PRIMARY_SOURCE });

  const handleSave = async (saveStatus: AdminSaveStatus) => {
    if (!vendor_id || !data.product_series) return toast.error("Vendor and product series are required");
    setSaving(true);
    const specPayload = buildProductPayload(data);
    const payload = buildProductUpdatePayload(specPayload, saveStatus, userId);
    const { data: inserted, error } = await supabase
      .from("ups_products")
      .insert({ ...payload, vendor_id })
      .select("id, product_series")
      .single();
    setSaving(false);
    if (error) return toast.error(error.message);
    await upsertPrimarySource(inserted.id, source);
    const after = snapshotProductForDiff({ ...data, ...payload, product_series: inserted.product_series });
    const before = snapshotProductForDiff({});
    const { changes, summary } = diffProductRecords(before, after);
    toast.success(`Product saved as ${saveStatus}`);
    setOpen(false);
    setData({});
    setSource({ ...EMPTY_PRIMARY_SOURCE });
    setVendor("");
    onCreated(inserted.id, `Created ${inserted.product_series} (${saveStatus})`, changes);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add UPS product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add UPS product</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Vendor</Label>
            <Select value={vendor_id} onValueChange={setVendor}>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ProductFieldGrid data={data} onChange={(key, value) => setData({ ...data, [key]: value })} />
          <PrimarySourceFields source={source} onChange={setSource} />
        </div>
        <SaveWorkflowFooter saving={saving} onSave={handleSave} />
      </DialogContent>
    </Dialog>
  );
}

function EditProductDialog({
  product,
  userId,
  onSaved,
}: {
  product: ProductRow;
  userId: string;
  onSaved: (
    summary: string,
    changes: ReturnType<typeof diffProductRecords>["changes"],
    productId: string,
  ) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<Record<string, unknown>>(product);
  const [source, setSource] = useState<PrimarySourceForm>({ ...EMPTY_PRIMARY_SOURCE });
  const [baseline, setBaseline] = useState<Record<string, unknown>>(snapshotProductForDiff(product));

  useEffect(() => {
    if (!open) return;
    setData(product);
    setBaseline(snapshotProductForDiff(product));
    supabase
      .from("sources")
      .select("*")
      .eq("product_id", product.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(({ data: s }) => {
        if (s) {
          setSource({
            id: s.id,
            title: s.title,
            url: s.url ?? "",
            source_type: s.source_type ?? "Datasheet",
            datasheet_date: s.datasheet_date ?? "",
            retrieved_date: s.retrieved_date ?? "",
          });
        } else {
          setSource({ ...EMPTY_PRIMARY_SOURCE });
        }
      });
  }, [open, product]);

  const handleSave = async (saveStatus: AdminSaveStatus) => {
    setSaving(true);
    const specPayload = buildProductPayload(data);
    const payload = buildProductUpdatePayload(specPayload, saveStatus, userId);
    const { error } = await supabase.from("ups_products").update(payload).eq("id", product.id);
    if (error) {
      setSaving(false);
      return toast.error(error.message);
    }
    await upsertPrimarySource(product.id, source);
    const after = snapshotProductForDiff({ ...data, ...payload });
    const { changes, summary } = diffProductRecords(baseline, after);
    setSaving(false);
    toast.success(`Saved as ${saveStatus}`);
    setOpen(false);
    onSaved(summary, changes, product.id);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {product.product_series}</DialogTitle>
        </DialogHeader>
        <ProductFieldGrid data={data} onChange={(key, value) => setData({ ...data, [key]: value })} />
        <PrimarySourceFields source={source} onChange={setSource} />
        <div className="mt-2 text-xs">
          <Badge variant="outline" className={verificationBadgeClass(product.verification_status)}>
            {product.verification_status}
          </Badge>
        </div>
        <SaveWorkflowFooter saving={saving} onSave={handleSave} />
      </DialogContent>
    </Dialog>
  );
}
