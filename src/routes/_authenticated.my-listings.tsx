import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { propertiesApi } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/my-listings")({ component: MyListingsPage });

function MyListingsPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["my-listings", user?.email],
    queryFn: () => propertiesApi.search({ page: 0, size: 100, sortBy: "createdAt", sortDir: "desc" }),
    enabled: !!user,
  });
  const mine = data?.content?.filter((p) => p.ownerEmail === user?.email) ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Moje nekretnine</h1>
          <p className="text-muted-foreground">Pregled i upravljanje vašim oglasima.</p>
        </div>
        <Button asChild><Link to="/new-property">Objavi novu</Link></Button>
      </div>
      {isLoading ? <p className="mt-8 text-muted-foreground">Učitavanje…</p> : mine.length === 0 ? (
        <div className="mt-12 text-center text-muted-foreground">
          <p>Nemate još nijedan oglas.</p>
          <Button asChild className="mt-4"><Link to="/new-property">Objavi prvi</Link></Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mine.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}