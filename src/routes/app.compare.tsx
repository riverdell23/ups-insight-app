import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, X } from "lucide-react";
import { verificationBadgeClass } from "@/lib/ups";
import { COMPARE_ROWS, downloadCompareCsv } from "@/lib/compare-csv";

type Search = { ids?: string };

export const Route = createFileRoute("/app/compare")({
  validateSearch: (s: Record<string, unknown>): Search => ({ ids: (s.ids as string) || "" }),
  component: ComparePage,
});

function ComparePage() {
  const { ids } = Route.useSearch();
  const navigate = Route.useNavigate();
  const idList = (ids ?? "").split(",").filter(Boolean);

  const { data: products } = useQuery({
    queryKey: ["compare", idList],
    queryFn: async () => {
      if (idList.length === 0) return [];
      const { data } = await supabase
        .from("ups_products")
        .select("*, vendors(name), verifier:profiles!ups_products_last_verified_by_fkey(full_name, email)")
        .in("id", idList);
      return data ?? [];
    },
  });

  const remove = (id: string) => {
    const next = idList.filter((x: string) => x !== id).join(",");
    navigate({ search: { ids: next } });
  };

  if (idList.length === 0) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold">Compare</h1>
        <p className="text-muted-foreground mt-2">Pick 2–4 products from the library to compare side-by-side.</p>
        <Link to="/app/library" className="mt-6 inline-block">
          <Button>Browse library</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Compare</h1>
          <p className="text-muted-foreground mt-1">{idList.length} of 4 products</p>
        </div>
        {products && products.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => downloadCompareCsv(products as Record<string, unknown>[])}
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 bg-muted/50 sticky left-0 z-10 min-w-[180px]">Spec</th>
                {products?.map((p: Record<string, unknown>) => (
                  <th key={String(p.id)} className="text-left p-4 border-l border-border bg-card min-w-[220px] align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-widest">
                          {(p.vendors as { name?: string })?.name}
                        </div>
                        <Link
                          to="/app/products/$id"
                          params={{ id: String(p.id) }}
                          className="font-display font-semibold hover:text-accent"
                        >
                          {String(p.product_series)}
                        </Link>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => remove(String(p.id))}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.label} className="border-t border-border">
                  <td className="p-3 text-muted-foreground bg-muted/30 sticky left-0">{row.label}</td>
                  {products?.map((p: Record<string, unknown>) => {
                    const val = row.getValue(p);
                    return (
                      <td key={String(p.id)} className="p-3 border-l border-border font-mono text-sm">
                        {row.label === "Verification" ? (
                          <Badge variant="outline" className={verificationBadgeClass(String(val))}>
                            {String(val)}
                          </Badge>
                        ) : (
                          (val ?? "—")
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Link to="/app/library">
        <Button variant="outline">Add more from library</Button>
      </Link>
    </div>
  );
}
