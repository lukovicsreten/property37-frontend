import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyCard } from "@/components/PropertyCard";
import { propertiesApi, locationsApi } from "@/lib/api/endpoints";
import { typeLabel } from "@/lib/format";

const PROPERTY_TYPES = ["STAN", "APARTMAN", "KUCA", "VILA", "ZEMLJISTE"] as const;

const searchSchema = z.object({
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  areaMin: z.coerce.number().optional(),
  areaMax: z.coerce.number().optional(),
  location: z.string().optional(),
  bedrooms: z.coerce.number().optional(),
  status: z.enum(["AVAILABLE", "SOLD"]).optional(),
  propertyType: z.enum(PROPERTY_TYPES).optional(),
  sortBy: z.string().optional().default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().optional().default(0),
});

export const Route = createFileRoute("/properties/")({
  validateSearch: searchSchema,
  component: PropertiesPage,
});

const SORT_MAP: Record<string, { sortBy: string; sortDir: "asc" | "desc" }> = {
  "createdAt-desc": { sortBy: "createdAt", sortDir: "desc" },
  "createdAt-asc":  { sortBy: "createdAt", sortDir: "asc"  },
  "price-asc":      { sortBy: "price",     sortDir: "asc"  },
  "price-desc":     { sortBy: "price",     sortDir: "desc" },
  "area-asc":       { sortBy: "area",      sortDir: "asc"  },
  "area-desc":      { sortBy: "area",      sortDir: "desc" },
};

function PropertiesPage() {
  const sp = Route.useSearch();
  const navigate = useNavigate({ from: "/properties/" });

  // Merge patch into current search params (uses sp directly — avoids stale prev)
  const update = (patch: Record<string, unknown>) =>
    navigate({ search: { ...sp, ...patch, page: (patch.page as number) ?? 0 } as never });

  const setSort = (value: string) => {
    const s = SORT_MAP[value];
    if (s) navigate({ search: { ...sp, sortBy: s.sortBy, sortDir: s.sortDir, page: 0 } as never });
  };

  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: () => locationsApi.getAll(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["properties", sp],
    queryFn: () => propertiesApi.search({ ...sp, size: 12 }),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Pretraga nekretnina</h1>
        <p className="text-muted-foreground">Filtrirajte po ceni, površini, lokaciji i tipu.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <Card className="p-4 space-y-4">
            <h2 className="font-medium">Filteri</h2>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Cena min</Label><Input type="number" defaultValue={sp.priceMin} onBlur={(e) => update({ priceMin: e.target.value || undefined })} /></div>
              <div><Label className="text-xs">Cena max</Label><Input type="number" defaultValue={sp.priceMax} onBlur={(e) => update({ priceMax: e.target.value || undefined })} /></div>
              <div><Label className="text-xs">m² min</Label><Input type="number" defaultValue={sp.areaMin} onBlur={(e) => update({ areaMin: e.target.value || undefined })} /></div>
              <div><Label className="text-xs">m² max</Label><Input type="number" defaultValue={sp.areaMax} onBlur={(e) => update({ areaMax: e.target.value || undefined })} /></div>
            </div>
            <div>
              <Label className="text-xs">Lokacija</Label>
              <Select value={sp.location ?? "all"} onValueChange={(v) => update({ location: v === "all" ? undefined : v })}>
                <SelectTrigger><SelectValue placeholder="Sve" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sve lokacije</SelectItem>
                  {locations?.map((l) => (
                    <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Tip nekretnine</Label>
              <Select value={sp.propertyType ?? "all"} onValueChange={(v) => update({ propertyType: v === "all" ? undefined : v })}>
                <SelectTrigger><SelectValue placeholder="Svi tipovi" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi tipovi</SelectItem>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{typeLabel(t)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Broj soba</Label>
              <Input type="number" defaultValue={sp.bedrooms} onBlur={(e) => update({ bedrooms: e.target.value || undefined })} />
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={sp.status ?? "all"} onValueChange={(v) => update({ status: v === "all" ? undefined : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sve</SelectItem>
                  <SelectItem value="AVAILABLE">Dostupno</SelectItem>
                  <SelectItem value="SOLD">Prodata</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate({ search: { sortBy: "createdAt", sortDir: "desc", page: 0 } as never })}>
              Resetuj
            </Button>
          </Card>
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {data ? `${data.totalElements} rezultata` : "—"}
            </p>
            <div className="flex items-center gap-2">
              <Select value={`${sp.sortBy}-${sp.sortDir}`} onValueChange={setSort}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Najnovije</SelectItem>
                  <SelectItem value="createdAt-asc">Najstarije</SelectItem>
                  <SelectItem value="price-asc">Cena ↑</SelectItem>
                  <SelectItem value="price-desc">Cena ↓</SelectItem>
                  <SelectItem value="area-asc">Površina ↑</SelectItem>
                  <SelectItem value="area-desc">Površina ↓</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-muted" />)}
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {data?.content?.map((p) => <PropertyCard key={p.id} p={p} />)}
              </div>
              {(!data?.content || data.content.length === 0) && (
                <p className="text-center text-muted-foreground py-16">Nema rezultata za zadate filtere.</p>
              )}
              {data && data.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button variant="outline" disabled={sp.page <= 0} onClick={() => update({ page: sp.page - 1 })}>← Prethodna</Button>
                  <span className="px-3 text-sm text-muted-foreground">{sp.page + 1} / {data.totalPages}</span>
                  <Button variant="outline" disabled={sp.page + 1 >= data.totalPages} onClick={() => update({ page: sp.page + 1 })}>Sledeća →</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
