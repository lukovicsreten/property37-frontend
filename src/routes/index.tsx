import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/PropertyCard";
import { propertiesApi } from "@/lib/api/endpoints";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data, isLoading } = useQuery({
    queryKey: ["properties", "featured"],
    queryFn: () => propertiesApi.search({ page: 0, size: 6, sortBy: "createdAt", sortDir: "desc" }),
  });

  return (
    <div>
      <section className="relative overflow-hidden border-b bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 px-3 py-1 text-xs">
              <Building2 className="h-3.5 w-3.5" /> Pouzdana platforma za nekretnine
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Pronađite svoj sledeći dom
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Stanovi, apartmani, kuće, vile i zemljišta — sve na jednom mestu, sa direktnom komunikacijom sa vlasnicima.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/properties"><Search className="mr-2 h-4 w-4" /> Pretraži nekretnine</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/register">Otvori nalog</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Najnovije nekretnine</h2>
            <p className="text-muted-foreground">Najsvežije objavljene oglase pogledaj odmah.</p>
          </div>
          <Button asChild variant="ghost"><Link to="/properties">Sve →</Link></Button>
        </div>
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data?.content?.map((p) => <PropertyCard key={p.id} p={p} />)}
            {(!data?.content || data.content.length === 0) && (
              <p className="col-span-full text-center text-muted-foreground py-12">
                Trenutno nema objavljenih nekretnina.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
