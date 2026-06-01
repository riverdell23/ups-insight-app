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

function formatBatteryOption(value?: string | null) {
  if (!value) return "-";

  const text = value.trim();

  const hasVrla = /VRLA/i.test(text);
  const hasVla = /\bVLA\b/i.test(text);
  const hasLithium = /lithium-ion|li-ion|lithium ion/i.test(text);
  const hasNicad = /nicad|ni-cd|nickel cadmium/i.test(text);

  const options: string[] = [];

  if (hasVrla) options.push("VRLA");
  if (hasVla) options.push("VLA");
  if (hasLithium) options.push("Li-ion");
  if (hasNicad) options.push("Ni-Cd");

  if (options.length > 0) {
    return options.join(" / ");
  }

  if (/battery options to verify|external battery options to verify|options to verify/i.test(text)) {
    return "To verify";
  }

  return text
    .replace(/lithium-ion/gi, "Li-ion")
    .replace(/options to verify/gi, "")
    .replace(/external battery/gi, "External battery")
    .replace(/\s+/g, " ")
    .trim();
}

function LibraryPage() {
  const { isAdmin } = useAuth();
  const searchParams = Route.useSearch() as { ids?: string };
  const [search, setSearch] = useState("");
  const [vendor, setVendor] = useState<string>("all");
  const [modular, setModular] = useState<string>("all");
  const [battery, setBattery] = useState<string>("all");
  const [minCap, setMinCap] = useState("");
  const [minEff, setMinEff] = useState("");
  const [selected, setSelected] = useState<string[]>(
    searchParams.ids ? searchParams.ids.split(",").filter(Boolean) : []
  );
  const [selectedRatingByProductId, setSelectedRatingByProductId] = useState<Record<string, string>>({});

  const { data: vendors } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => (await supabase.from("vendors").select("id,name").order("name")).data ?? [],
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await supabase.from("ups_products").select("*, vendors(id,name),ups_ratings(id,rating_label,kw,dimensions,footprint_m2,weight_kg))").order("product_series")).data ?? [],
  });
  const physicalDataStatus = (product: any) => {
    const ratings = product.ups_ratings ?? [];
  
    if (ratings.length === 0) {
      return {
        label: "To verify",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };
    }
  
    const completeCount = ratings.filter(
      (rating: any) => rating.dimensions && rating.footprint_m2 && rating.weight_kg
    ).length;
  
    if (completeCount === ratings.length) {
      return {
        label: "Complete",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    }
  
    if (completeCount > 0) {
      return {
        label: "Partial",
        className: "border-blue-200 bg-blue-50 text-blue-700",
      };
    }
  
    return {
      label: "To verify",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  };
  const filtered = useMemo(() => {
    return (products ?? []).filter((p: any) => {
      if (!isAdmin && p.verification_status === "Draft") return false;
      const searchText = `${p.vendors?.name ?? ""} ${p.product_series ?? ""}`.toLowerCase();
const normalizedSearch = search.toLowerCase().trim();

const searchAliases: Record<string, string[]> = {
  rehlko: ["rehlko", "kohler"],
  kohler: ["kohler", "rehlko"],
};

const searchTerms = searchAliases[normalizedSearch] ?? [normalizedSearch];

if (normalizedSearch && !searchTerms.some((term) => searchText.includes(term))) return false;
      if (vendor !== "all" && p.vendor_id !== vendor) return false;
      if (modular !== "all" && p.modular_type !== modular) return false;
      if (battery !== "all" && !(p.battery_type ?? "").toLowerCase().includes(battery.toLowerCase())) return false;
      if (minCap) {
        const targetKw = Number(minCap);
        const minKw = Number(p.min_capacity_kw ?? 0);
        const maxKw = Number(p.max_capacity_kw ?? 0);
      
        if (targetKw < minKw || targetKw > maxKw) return false;
      }
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
  
      const params = new URLSearchParams();
params.set("ids", selected.join(","));
if (selectedRatings) params.set("ratings", selectedRatings);
window.location.href = `/app/compare?${params.toString()}`;
  
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
      <div className="flex flex-wrap items-start gap-3">
      <div className="relative w-[280px]">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input className="w-[280px] pl-9" placeholder="Search vendor or series..." value={search} onChange={(e) => setSearch(e.target.value)} />
</div>
          <Select value={vendor} onValueChange={setVendor}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="UPS Vendor" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">UPS vendors</SelectItem>
              {vendors?.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={modular} onValueChange={setModular}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="UPS Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">UPS Type</SelectItem>
              <SelectItem value="Modular">Modular</SelectItem>
              <SelectItem value="Monolithic">Monolithic</SelectItem>
            </SelectContent>
          </Select>
          <Select value={battery} onValueChange={setBattery}>
          <SelectTrigger className="w-[240px]"><SelectValue placeholder="Battery chemistries" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Battery chemistries</SelectItem>
              <SelectItem value="VRLA">VRLA</SelectItem>
              <SelectItem value="Li-ion">Li-ion</SelectItem>
            </SelectContent>
          </Select>

          <div className="w-full flex flex-wrap gap-3">
  <Input
    className="w-[340px]"
    placeholder="Minimum double-conv. efficiency %"
    type="number"
    value={minEff}
    onChange={(e) => setMinEff(e.target.value)}
  />
  <Input
    className="w-[300px]"
    placeholder="Enter target UPS load (kW)"
    type="number"
    value={minCap}
    onChange={(e) => setMinCap(e.target.value)}
  />
</div>
          
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
              <th className="w-10 p-3"></th>

<th className="w-[260px] text-left p-3 align-top">
  <div>UPS Series</div>
  <div className="text-xs font-normal text-muted-foreground">&nbsp;</div>
</th>
<th className="w-[150px] px-4 py-3 text-right">
  <div>Min Capacity</div>
  <div className="text-xs font-normal text-muted-foreground">(kW)</div>
</th>

<th className="text-right p-3">
  <div>Max Capacity</div>
  <div className="text-xs font-normal text-muted-foreground">(kW)</div>
</th>

<th className="text-right p-3">
  <div>Max Parallel</div>
  <div className="text-xs font-normal text-muted-foreground">(kW)</div>
</th>

<th className="text-right p-3">
  <div>Double Conv. Eff</div>
  <div className="text-xs font-normal text-muted-foreground">(%)</div>
</th>
<th className="text-left p-3 align-top">
  <div>Battery Option</div>
  <div className="text-xs font-normal text-muted-foreground">&nbsp;</div>
</th>
<th className="text-left p-3 align-top">
  <div>Physical Data</div>
  <div className="text-xs font-normal text-muted-foreground">&nbsp;</div>
</th>
<th className="text-left p-3 align-top">
  <div>Status</div>
  <div className="text-xs font-normal text-muted-foreground">&nbsp;</div>
</th>
               
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
              {!isLoading && filtered.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">No products match your filters.</td></tr>}
              {filtered.map((p: any) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3"><Checkbox checked={selected.includes(p.id)} onCheckedChange={() => toggle(p.id)} /></td>
                  <td className="p-3">
                  <Link
  to="/app/products/$id"
  params={{ id: p.id }}
  className="group cursor-pointer inline-block"
>
  <div className="font-medium group-hover:underline underline-offset-4 group-hover:text-primary">
    {p.vendors?.name}
  </div>
  <div className="text-xs text-muted-foreground font-medium group-hover:underline underline-offset-4 group-hover:text-primary">
    {p.product_series}
  </div>
</Link>
                  </td>
                  
                  <td className="w-[150px] px-4 py-3 text-right font-mono">
  {p.min_capacity_kw ?? "-"}
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
{formatBatteryOption(p.battery_type)}
</td>
<td className="p-3">
  {(() => {
    const status = physicalDataStatus(p);
    return (
      <Badge variant="outline" className={status.className}>
        {status.label}
      </Badge>
    );
  })()}
</td>
                  <td className="p-3"><Badge variant="outline" className={verificationBadgeClass(p.verification_status)}>{p.verification_status}</Badge></td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
