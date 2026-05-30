import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, GitCompare, X } from "lucide-react";
import { verificationBadgeClass } from "@/lib/ups";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/app/library")({ component: LibraryPage });

function LibraryPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [vendor, setVendor] = useState<string>("all");
  const [modular, setModular] = useState<string>("all");
  const [battery, setBattery] = useState<string>("all");
  const [minCap, setMinCap] = useState("");
  const [minEff, setMinEff] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedRatingByProductId, setSelectedRatingByProductId] = useState<Record<string, string>>({});

  const { data: vendors } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => (await supabase.from("vendors").select("id,name").order("name")).data ?? [],
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await supabase.from("ups_products").select("*, vendors(id,name),ups_ratings(id,rating_label,kw)").order("product_series")).data ?? [],
  });

  const filtered = useMemo(() => {
    return (products ?? []).filter((p: any) => {
      if (!isAdmin && p.verification_status === "Draft") return false;
      if (search && !`${p.vendors?.name} ${p.product_series}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (vendor !== "all" && p.vendor_id !== vendor) return false;
      if (modular !== "all" && p.modular_type !== modular) return false;
      if (battery !== "all" && !(p.battery_type ?? "").toLowerCase().includes(battery.toLowerCase())) return false;
      if (minCap && (p.max_capacity_kw ?? 0) < Number(minCap)) return false;
      if (minEff && (p.double_conversion_efficiency ?? 0) < Number(minEff)) return false;
      return true;
    });
  }, [products, search, vendor, modular, battery, minCap, minEff, isAdmin]);

  const toggle = (id: string) => {
    setSelected((s) => {
      if (s.includes(id)) return s.filter((x) => x !== id);
      if (s.length >= 4) { toast.error("Compare up to 4 products"); return s; }
      return [...s, id];
    });
  };

  const goCompare = () => {
    if (selected.length < 2) return toast.error("Select at least 2 products");
  
    const selectedRatings = selected
      .map((productId) => {
        const ratingId = selectedRatingByProductId[productId];
        return ratingId ? `${productId}:${ratingId}` : null;
      })
      .filter(Boolean)
      .join(",");
  
    navigate({
      to: "/app/compare",
      search: {
        ids: selected.join(","),
        ratings: selectedRatings,
      },
    });
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">UPS Library</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} products · vendor-neutral catalogue</p>
        </div>
        {selected.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selected.length} selected</span>
            <Button onClick={goCompare} className="gap-2"><GitCompare className="h-4 w-4" /> Compare</Button>
            <Button variant="ghost" size="icon" onClick={() => setSelected([])}><X className="h-4 w-4" /></Button>
          </div>
        )}
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search vendor or series…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={vendor} onValueChange={setVendor}>
            <SelectTrigger><SelectValue placeholder="Vendor" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All vendors</SelectItem>
              {vendors?.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={modular} onValueChange={setModular}>
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="Modular">Modular</SelectItem>
              <SelectItem value="Monolithic">Monolithic</SelectItem>
            </SelectContent>
          </Select>
          <Select value={battery} onValueChange={setBattery}>
            <SelectTrigger><SelectValue placeholder="Battery" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All chemistries</SelectItem>
              <SelectItem value="VRLA">VRLA</SelectItem>
              <SelectItem value="Li-ion">Li-ion</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Min kW" type="number" value={minCap} onChange={(e) => setMinCap(e.target.value)} />
          <Input placeholder="Min efficiency %" type="number" value={minEff} onChange={(e) => setMinEff(e.target.value)} />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="w-10 p-3"></th>
                <th className="text-left p-3">Vendor / Series</th>
                <th className="text-left p-3">Type</th><th className="px-4 py-3 text-left">Ratings</th>
                <th className="px-4 py-3 text-left">Selected rating</th>
                <th className="text-right p-3">Capacity (kW)</th>
                <th className="text-right p-3">Parallel (kW)</th>
                <th className="text-right p-3">DC Eff %</th>
                <th className="text-left p-3">Battery</th>
                <th className="text-left p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
              {!isLoading && filtered.length === 0 && <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">No products match your filters.</td></tr>}
              {filtered.map((p: any) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3"><Checkbox checked={selected.includes(p.id)} onCheckedChange={() => toggle(p.id)} /></td>
                  <td className="p-3">
                    <Link to="/app/products/$id" params={{ id: p.id }} className="font-medium hover:text-accent">{p.vendors?.name}</Link>
                    <div className="text-xs text-muted-foreground">{p.product_series}</div>
                  </td>
                  <td className="p-3">{p.modular_type}</td>
                  <td className="px-4 py-3">
  <select
    className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
    value={selectedRatingByProductId[String(p.id)] ?? ""}
    onChange={(event) =>
      setSelectedRatingByProductId((current) => ({
        ...current,
        [String(p.id)]: event.target.value,
      }))
    }
  >
    <option value="">Auto</option>
    {(p.ups_ratings ?? [])
      .slice()
      .sort((a: any, b: any) => Number(a.kw ?? 0) - Number(b.kw ?? 0))
      .map((rating: any) => (
        <option key={String(rating.id)} value={String(rating.id)}>
          {rating.rating_label ?? `${rating.kw ?? "-"} kW`}
        </option>
      ))}
  </select>
</td>
                  <td className="p-3 text-right font-mono">
  {p.min_capacity_kw && p.max_capacity_kw
    ? `${p.min_capacity_kw}-${p.max_capacity_kw}`
    : p.min_capacity_kw ?? p.max_capacity_kw ?? "-"}
</td>

<td className="p-3 text-right font-mono">
  {p.max_capacity_kw ?? "-"}
</td>

<td className="p-3 text-right font-mono">
  {p.max_parallel_kw ?? "-"}
</td>

<td className="p-3 text-right font-mono">
  {p.double_conversion_efficiency ?? "-"}
</td>

<td className="p-3">
  {p.battery_type ?? "-"}
</td>
                  <td className="p-3"><Badge variant="outline" className={verificationBadgeClass(p.verification_status)}>{p.verification_status}</Badge></td>
                  <td className="p-3"><Link to="/app/products/$id" params={{ id: p.id }}><Button variant="ghost" size="sm">View</Button></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
