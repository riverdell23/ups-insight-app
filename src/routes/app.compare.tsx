import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, X } from "lucide-react";
import { verificationBadgeClass } from "@/lib/ups";
import { COMPARE_ROWS, downloadCompareCsv } from "@/lib/compare-csv";

type Search = { ids?: string; ratings?: string };

export const Route = createFileRoute("/app/compare")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    ids: (s.ids as string) || "",
    ratings: (s.ratings as string) || "",
  }),
  component: ComparePage,
});

function ComparePage() {
  const { ids, ratings } = Route.useSearch();
  const navigate = Route.useNavigate();
  const idList = (ids ?? "").split(",").filter(Boolean);
  const ratingPairs = (ratings ?? "").split(",").filter(Boolean);

const ratingFromUrlByProductId = ratingPairs.reduce<Record<string, string>>((acc, pair) => {
  const [productId, ratingId] = pair.split(":");
  if (productId && ratingId) acc[productId] = ratingId;
  return acc;
}, {});
const [selectedRatingByProductId, setSelectedRatingByProductId] = useState<Record<string, string>>(
  ratingFromUrlByProductId
);
  const { data: products } = useQuery({
    queryKey: ["compare", idList],
    queryFn: async () => {
      if (idList.length === 0) return [];
      const { data } = await supabase
        .from("ups_products")
        .select(`
          *,
          vendors(name),
          verifier:profiles!ups_products_last_verified_by_fkey(full_name, email),
          ups_ratings(*)
        `)
        .in("id", idList);
      return data ?? [];
    },
  });
  const display = (value: unknown) =>
    value === null || value === undefined || value === "" ? "-" : String(value);
  
  const productList = (products ?? []) as any[];
  
  const getSortedRatings = (product: any) =>
    [...(product.ups_ratings ?? [])].sort(
      (a: any, b: any) => Number(a.kw ?? 0) - Number(b.kw ?? 0)
    );
  
    const getSelectedRating = (product: any) => {
      const ratings = getSortedRatings(product);
      const selectedRatingId = selectedRatingByProductId[String(product.id)];
    
      if (selectedRatingId) {
        return ratings.find((rating: any) => String(rating.id) === selectedRatingId) ?? ratings[0] ?? null;
      }
    
      return ratings[0] ?? null;
    };
    const csvEscape = (value: unknown) => {
      const text = display(value);
      return `"${text.replace(/"/g, '""')}"`;
    };
    
    const downloadRatingCompareCsv = () => {
      const selectedProducts = productList;
    
      const headers = [
        "Spec",
        ...selectedProducts.map((p: any) => {
          const rating = getSelectedRating(p);
          const vendor = (p.vendors as { name?: string })?.name ?? "";
          return `${vendor} - ${p.product_series} - ${rating?.rating_label ?? ""}`;
        }),
      ];
    
      const rows = [
        ["Vendor", (p: any) => (p.vendors as { name?: string })?.name],
        ["Product series", (p: any) => p.product_series],
        ["Selected rating", (p: any) => getSelectedRating(p)?.rating_label],
        ["kVA", (p: any) => getSelectedRating(p)?.kva],
        ["kW", (p: any) => getSelectedRating(p)?.kw],
        ["Efficiency", (p: any) => getSelectedRating(p)?.efficiency ?? "To verify"],
        ["Dimensions", (p: any) => getSelectedRating(p)?.dimensions ?? "To verify"],
        ["Footprint (m²)", (p: any) => getSelectedRating(p)?.footprint_m2 ?? "To verify"],
        ["Weight (kg)", (p: any) => getSelectedRating(p)?.weight_kg ?? "To verify"],
        ["Battery option", (p: any) => getSelectedRating(p)?.battery_option ?? "To verify"],
        ["Datasheet/source", (p: any) => getSelectedRating(p)?.datasheet_url ?? "To verify"],
      ];
    
      const csvRows = [
        headers.map(csvEscape).join(","),
        ...rows.map(([label, getter]: any) =>
          [label, ...selectedProducts.map((p: any) => getter(p))]
            .map(csvEscape)
            .join(",")
        ),
      ];
    
      const blob = new Blob([csvRows.join("\n")], {
        type: "text/csv;charset=utf-8;",
      });
    
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ups-rating-compare-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    };
  const remove = (id: string) => {
    const next = idList.filter((x: string) => x !== id).join(",");
    navigate({ search: { ids: next } });
  };

  if (idList.length === 0) {
    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold">Compare UPS Ratings</h1>
<p className="text-muted-foreground mt-2">
  Select 2–4 UPS products from the Library to compare selected ratings side-by-side.
</p>
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
        <h1 className="font-display text-3xl font-bold">Compare UPS Ratings</h1>
<p className="text-muted-foreground mt-1">
  {idList.length} of 4 products selected. Comparison is for preliminary screening only. Verify latest manufacturer datasheets before design use.
</p>
        </div>
        {products && products.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={downloadRatingCompareCsv}
          >
            <Download className="h-4 w-4" /> Export Selected Rating CSV
          </Button>
        )}
      </div>
      {productList.length > 0 && (
  <Card className="mb-6 overflow-hidden">
    <div className="border-b p-4">
      <h2 className="text-xl font-semibold">Rating-level Comparison</h2>
      <p className="text-sm text-muted-foreground">
      Select and compare exact UPS ratings under each selected product series.
      </p>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left p-4 bg-muted/50 sticky left-0 z-10 min-w-[180px]">
              Spec
            </th>
            {productList.map((p: any) => {
              const rating = getSelectedRating(p);

              return (
                <th
                  key={String(p.id)}
                  className="text-left p-4 border-l border-border bg-card min-w-[240px] align-top"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-widest">
                        {(p.vendors as { name?: string })?.name}
                      </div>
                      <div className="font-semibold">{p.product_series}</div>
                      <select
  className="mt-2 w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
  value={String(rating?.id ?? "")}
  onChange={(event) =>
    setSelectedRatingByProductId((current) => ({
      ...current,
      [String(p.id)]: event.target.value,
    }))
  }
>
  {getSortedRatings(p).map((option: any) => (
    <option key={String(option.id)} value={String(option.id)}>
      {option.rating_label ?? `${option.kw ?? "-"} kW`}
    </option>
  ))}
</select>
                    </div>

                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => remove(String(p.id))}
                    >
                      ×
                    </button>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {[
            ["Rating", (r: any) => r?.rating_label],
            ["kVA", (r: any) => r?.kva],
            ["kW", (r: any) => r?.kw],
            ["Efficiency", (r: any) => r?.efficiency ?? "To verify"],
            ["Dimensions", (r: any) => r?.dimensions ?? "To verify"],
            ["Footprint (m²)", (r: any) => r?.footprint_m2 ?? "To verify"],
            ["Weight (kg)", (r: any) => r?.weight_kg ?? "To verify"],
            ["Battery option", (r: any) => r?.battery_option ?? "To verify"],
            ["Datasheet/source", (r: any) => r?.datasheet_url ?? "To verify"],
          ].map(([label, getter]: any) => (
            <tr key={label} className="border-t border-border">
              <td className="p-4 font-medium bg-muted/30 sticky left-0 z-10">
                {label}
              </td>

              {productList.map((p: any) => {
                const rating = getSelectedRating(p);

                return (
                  <td
                    key={String(p.id)}
                    className="p-4 border-l border-border align-top"
                  >
                  {label === "Datasheet/source" && getter(rating) !== "To verify" ? (
  <a
    href={String(getter(rating))}
    target="_blank"
    rel="noreferrer"
    className="underline underline-offset-4 text-primary"
  >
    Source
  </a>
) : (
  display(getter(rating))
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
)}
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
