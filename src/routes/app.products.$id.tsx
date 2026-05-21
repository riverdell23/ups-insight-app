import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { verificationBadgeClass } from "@/lib/ups";

export const Route = createFileRoute("/app/products/$id")({ component: ProductDetail });

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
    ["Footprint (m²)", product.footprint_area_m2],
    ["Power density (kW/m²)", product.power_density_kw_per_m2],
    ["Access requirement", product.access_requirement],
    ["Monitoring protocols", product.monitoring_protocol],
    ["Region availability", product.region_availability],
    ["Region availability (detail)", product.region_availability_detail],
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <Link to="/app/library"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to library</Button></Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{product.vendors?.name}</div>
          <h1 className="font-display text-4xl font-bold mt-1">{product.product_series}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
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
            {specs?.map((s) => (
              <div key={s.id} className="grid grid-cols-2 gap-4 py-3 text-sm">
                <dt className="text-muted-foreground">{s.spec_key}</dt>
                <dd className="font-medium">{s.spec_value ?? "—"}</dd>
              </div>
            ))}
          </dl>
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
