import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { verificationBadgeClass } from "@/lib/ups";

export const Route = createFileRoute("/app/products/$id")({ component: ProductDetail });

function formatBatteryOption(value?: string | null) {
  if (!value) return "-";

  return value
    .replace(/lithium-ion/gi, "Li-ion")
    .replace(/options to verify/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
function getDoubleConversionEff(value?: string | null) {
  if (!value) return "-";

  const text = value.trim();
  const match = text.match(/([\d.]+)%\s*double/i);

  return match ? `${match[1]}%` : "-";
}

function getEcoModeEff(value?: string | null) {
  if (!value) return "-";

  const text = value.trim();
  const essMatch = text.match(/([\d.]+)%\s*ESS/i);
  const ecoMatch = text.match(/([\d.]+)%\s*eco/i);

  if (essMatch) return `${essMatch[1]}%`;
  if (ecoMatch) return `${ecoMatch[1]}%`;

  return "-";
}


function formatDimensionsMetric(value: string | null) {
  if (!value) return "-";

  const text = value.trim();

  // Already shortened format: 550 x 800 x 1450
  const shortMetricMatch = text.match(/^([\d.]+)\s*x\s*([\d.]+)\s*x\s*([\d.]+)$/i);
  if (shortMetricMatch) {
    return `${shortMetricMatch[1]} x ${shortMetricMatch[2]} x ${shortMetricMatch[3]}`;
  }

  // Existing metric format: 550 mm W x 800 mm D x 1450 mm H
  const metricMatch = text.match(
    /([\d.]+)\s*mm\s*W\s*x\s*([\d.]+)\s*mm\s*D\s*x\s*([\d.]+)\s*mm\s*H/i
  );
  if (metricMatch) {
    return `${metricMatch[1]} x ${metricMatch[2]} x ${metricMatch[3]}`;
  }

  // Imperial format: 93.5 in W x 33.5 in D x 78.9 in H
  const inchMatch = text.match(
    /([\d.]+)\s*in\s*W\s*x\s*([\d.]+)\s*in\s*D\s*x\s*([\d.]+)\s*in\s*H/i
  );
  if (inchMatch) {
    const widthMm = Math.round(Number(inchMatch[1]) * 25.4);
    const depthMm = Math.round(Number(inchMatch[2]) * 25.4);
    const heightMm = Math.round(Number(inchMatch[3]) * 25.4);

    return `${widthMm} x ${depthMm} x ${heightMm}`;
  }

  return text;
}
function ProductDetail() {
  const { id } = Route.useParams();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () =>
      (
        await supabase
          .from("ups_products")
          .select("*, vendors(*), verifier:profiles!ups_products_last_verified_by_fkey(full_name, email)")
          .eq("id", id)
          .single()
      ).data,
  });
  const { data: sources } = useQuery({
    queryKey: ["sources", id],
    queryFn: async () => (await supabase.from("sources").select("*").eq("product_id", id)).data ?? [],
  });
  const { data: specs } = useQuery({
    queryKey: ["specs", id],
    queryFn: async () => (await supabase.from("ups_specs").select("*").eq("product_id", id)).data ?? [],
  });
  const { data: ratings } = useQuery({
    queryKey: ["ratings", id],
    queryFn: async () =>
      (await supabase
        .from("ups_ratings")
        .select("*")
        .eq("product_id", id)
        .order("kw", { ascending: true })).data ?? [],
  });
  
  const [selectedRating, setSelectedRating] = useState<any>(null);
  const physicalData = (() => {
    const ratingList = ratings ?? [];
  
    if (ratingList.length === 0) {
      return {
        label: "Physical data: To verify",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };
    }
  
    const completeCount = ratingList.filter(
      (rating: any) => rating.dimensions && rating.footprint_m2 && rating.weight_kg
    ).length;
  
    if (completeCount === ratingList.length) {
      return {
        label: "Physical data: Complete",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    }
  
    if (completeCount > 0) {
      return {
        label: "Physical data: Partial",
        className: "border-blue-200 bg-blue-50 text-blue-700",
      };
    }
  
    return {
      label: "Physical data: To verify",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  })();
  if (isLoading) return <div className="text-muted-foreground">Loading…</div>;
  if (!product) return <div>Not found</div>;

  const rows: Array<[string, any]> = [
    ["Topology", product.topology],
    ["Architecture", product.modular_type],
    ["Capacity range (kW)", `${product.min_capacity_kw} – ${product.max_capacity_kw}`],
    ["Max parallel (kW)", product.max_parallel_kw],
    ["Double-conversion efficiency", `${product.double_conversion_efficiency}%`],
    ["Eco-mode efficiency", `${product.eco_mode_efficiency}%`],
    ["Battery type", product.battery_type],

  ];

  return (
    <div className="space-y-6 w-full">
      <Link to="/app/library"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to library</Button></Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{product.vendors?.name}</div>
          <h1 className="font-display text-4xl font-bold mt-1">{product.product_series}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline" className={physicalData.className}>
  {physicalData.label}
</Badge>
            <Badge variant="outline" className={verificationBadgeClass(product.verification_status)}>{product.verification_status}</Badge>
            {product.last_verified_date && <Badge variant="outline">Last verified: {product.last_verified_date}</Badge>}
            {product.verifier && (
              <Badge variant="outline">
                By: {product.verifier.full_name || product.verifier.email}
              </Badge>
            )}
          </div>
          {product.verification_notes && (
            <p className="mt-3 text-sm text-muted-foreground max-w-2xl">{product.verification_notes}</p>
          )}
        </div>
        <Link to="/app/compare" search={{ ids: product.id }}><Button>Add to comparison</Button></Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Specifications</h2>
          <dl className="divide-y divide-border">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-2 gap-4 py-3 text-sm">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v ?? "—"}</dd>
              </div>
            ))}
            
          </dl>
        </Card>
        <Card className="lg:col-span-3 p-6 w-full">
        <div className="mb-4">
  <h2 className="font-display text-lg font-semibold">Available Ratings</h2>
  <p className="mt-1 text-sm text-muted-foreground">
    Physical data is for preliminary screening only. Verify the latest manufacturer datasheet before design use.
  </p>
</div>

  {!ratings?.length ? (
    <p className="text-sm text-muted-foreground">No rating options recorded.</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
          <th className="py-2 pr-4 align-top">Rating</th>
          <th className="py-2 pr-4 align-top">kVA</th>
          <th className="py-2 pr-4 align-top">kW</th>
          <th className="py-2 pr-4 whitespace-nowrap align-top">Double-Conversion Eff.</th>
          <th className="py-2 pr-4 whitespace-nowrap align-top">Eco Mode Eff.</th>
<th className="py-2 pr-4 whitespace-nowrap align-top">
  <div>Dimensions</div>
  <div className="text-xs font-normal text-muted-foreground">
    mmW x mmD x mmH
  </div>
</th>
<th className="py-2 pr-4 whitespace-nowrap align-top">
  <div>Footprint</div>
  <div className="text-xs font-normal text-muted-foreground">
    m²
  </div>
</th>
<th className="py-2 pr-4 whitespace-nowrap align-top">
  <div>Weight</div>
  <div className="text-xs font-normal text-muted-foreground">
    kg
  </div>
</th>
<th className="py-2 pr-4 align-top">Battery option</th>
<th className="py-2 pr-4 align-top">Datasheet/source</th>
<th className="py-2 pr-4 align-top">Last updated</th>
          </tr>
        </thead>
        <tbody>
          {ratings.map((rating: any) => (
            <tr
              key={rating.id}
              className="border-b hover:bg-muted/40 cursor-pointer"
              onClick={() => setSelectedRating(rating)}
            >
              <td className="py-3 pr-4 font-medium whitespace-nowrap">{rating.rating_label ?? "-"}</td>
              <td className="py-3 pr-4">{rating.kva ?? "-"}</td>
              <td className="py-3 pr-4">{rating.kw ?? "-"}</td>
              
              <td className="py-3 pr-4 whitespace-nowrap">
  {getDoubleConversionEff(rating.efficiency)}
</td>
<td className="py-3 pr-4 whitespace-nowrap">
  {getEcoModeEff(rating.efficiency)}
</td>
              
              <td className="py-3 pr-4">{formatDimensionsMetric(rating.dimensions)}</td>
              <td className="py-3 pr-4">{rating.footprint_m2 ?? "-"}</td>
              <td className="py-3 pr-4">{rating.weight_kg ?? "-"}</td>
              <td className="py-3 pr-4">
  {formatBatteryOption(rating.battery_option)}
</td>
              <td className="py-3 pr-4">
                {rating.datasheet_url ? (
                  <a
                    href={rating.datasheet_url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Source
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td className="py-3 pr-4 whitespace-nowrap">{rating.last_updated ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}

 
</Card>
        <Card className="p-6 h-fit">
          <h2 className="font-display text-lg font-semibold mb-4">Sources</h2>
          {sources?.length === 0 && <p className="text-sm text-muted-foreground">No sources recorded.</p>}
          <ul className="space-y-3">
            {sources?.map((s) => (
              <li key={s.id} className="text-sm">
                <a href={s.url ?? "#"} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline inline-flex items-center gap-1">
                  {s.title} <ExternalLink className="h-3 w-3" />
                </a>
                <div className="text-xs text-muted-foreground">
                  {[s.source_type, s.datasheet_date && `Datasheet ${s.datasheet_date}`, s.retrieved_date && `Retrieved ${s.retrieved_date}`]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
