import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Library, ClipboardList, ShieldCheck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/app/")({ component: Dashboard });

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [{ data: allProducts }, { count: vendors }] = await Promise.all([
        supabase.from("ups_products").select("verification_status"),
        supabase.from("vendors").select("*", { count: "exact", head: true }),
      ]);
      const totalProducts = (allProducts ?? []).length;
      const verified = (allProducts ?? []).filter((r) => r.verification_status === "Verified").length;
      return { products: totalProducts, vendors: vendors ?? 0, verified };
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["dashboard-recent"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ups_products")
        .select("id, product_series, max_capacity_kw, verification_status, last_verified_date, vendors(name)")
        .neq("verification_status", "Draft")
        .order("last_verified_date", { ascending: false, nullsFirst: false })
        .limit(6);
      return data ?? [];
    },
  });

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Live overview of the UPS spec library.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="UPS products" value={stats?.products ?? "—"} />
        <StatCard label="Vendors" value={stats?.vendors ?? "—"} />
        <StatCard label="Verified specs" value={stats?.verified ?? "—"} accent />
        <StatCard label="Compare slots" value="up to 4" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Link to="/app/library"><ActionCard icon={Library} title="UPS Library" desc="Search and filter the full catalogue" /></Link>
        
        <Link to="/app/checklist"><ActionCard icon={ClipboardList} title="Enquiry checklist" desc="Generate a vendor RFQ checklist" /></Link>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-accent" /> Recently verified</h2>
          <Link to="/app/library"><Button variant="ghost" size="sm" className="gap-1">View all <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
        <div className="divide-y divide-border">
          {(recent ?? []).map((p: any) => (
            <Link key={p.id} to="/app/products/$id" params={{ id: p.id }} className="flex items-center justify-between py-3 hover:bg-muted/40 rounded px-2 -mx-2">
              <div>
                <div className="font-medium">{p.vendors?.name} · {p.product_series}</div>
                <div className="text-xs text-muted-foreground">{p.max_capacity_kw} kW · {p.verification_status}</div>
              </div>
              <div className="text-xs text-muted-foreground font-mono">{p.last_verified_date}</div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: any; accent?: boolean }) {
  return (
    <Card className={`p-5 ${accent ? "bg-primary text-primary-foreground border-primary" : ""}`}>
      <div className={`text-xs uppercase tracking-widest ${accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{label}</div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
    </Card>
  );
}

function ActionCard({ icon: Icon, title, desc }: any) {
  return (
    <Card className="p-6 hover:border-accent transition-colors cursor-pointer h-full">
      <Icon className="h-6 w-6 text-accent" />
      <div className="mt-4 font-display font-semibold">{title}</div>
      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
    </Card>
  );
}
