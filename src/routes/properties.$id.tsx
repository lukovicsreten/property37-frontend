import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Bed, Maximize, MapPin, Pencil, Trash2, Bath, Layers,
  Flame, Zap, ChevronLeft, ChevronRight, TreePine, Car,
  Waves, Home, Star,
} from "lucide-react";
import { propertiesApi } from "@/lib/api/endpoints";
import type { PropertyResponse } from "@/lib/api/types";
import { formatPrice, formatArea, formatDate, statusLabel, typeLabel } from "@/lib/format";
import { propertyTypeOf } from "@/lib/api/property-utils";
import { CommentsSection } from "@/components/CommentsSection";
import { MessageOwnerDialog } from "@/components/MessageOwnerDialog";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/properties/$id")({ component: PropertyDetail });

const FALLBACK = (id: number) =>
  `https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1400&auto=format&q=80&sig=${id}`;

function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [current, setCurrent] = useState(0);
  const all = images.length > 0 ? images : [];
  const mainSrc = all[current] ?? FALLBACK(0);

  if (all.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl bg-muted aspect-[16/10]">
        <img src={FALLBACK(0)} alt={title} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-xl bg-muted aspect-[16/10] group">
        <img src={mainSrc} alt={`${title} – ${current + 1}`} className="h-full w-full object-cover transition-opacity duration-200" />
        {all.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((c) => (c - 1 + all.length) % all.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrent((c) => (c + 1) % all.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
              {current + 1} / {all.length}
            </span>
          </>
        )}
      </div>
      {all.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {all.map((src, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 h-16 w-24 overflow-hidden rounded-md border-2 transition-all ${i === current ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"}`}
            >
              <img src={src} alt={`Slika ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyDetail() {
  const { id } = Route.useParams();
  const pid = Number(id);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: p, isLoading } = useQuery({
    queryKey: ["property", pid],
    queryFn: () => propertiesApi.getById(pid),
  });

  const del = useMutation({
    mutationFn: () => propertiesApi.delete(pid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Obrisano");
      navigate({ to: "/properties" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="container mx-auto px-4 py-12 text-muted-foreground">Učitavanje…</div>;
  if (!p) return <div className="container mx-auto px-4 py-12">Nekretnina nije pronađena.</div>;

  const ptype = propertyTypeOf(p);
  const mine = isAuthenticated && user?.email && p.ownerEmail && user.email === p.ownerEmail;
  const images = p.imageUrls?.length ? p.imageUrls : (p.imageUrl ? [p.imageUrl] : []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link to="/properties" className="text-sm text-muted-foreground hover:text-foreground">← Nazad na pretragu</Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Lijeva kolona */}
        <div className="min-w-0">
          <ImageGallery images={images} title={p.title} />

          <div className="mt-6 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex gap-2 mb-2 flex-wrap">
                <Badge className="bg-primary text-primary-foreground">{statusLabel(p.status)}</Badge>
                <Badge variant="secondary">{typeLabel(ptype)}</Badge>
                {p.averageRating != null && p.averageRating > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {p.averageRating.toFixed(1)}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">{p.title}</h1>
              {p.location && (
                <p className="mt-2 flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {String(p.location).replaceAll("_", " ")}
                </p>
              )}
            </div>
            {mine && (
              <div className="flex gap-2 flex-shrink-0">
                <Button asChild variant="outline" size="sm">
                  <Link to="/edit-property/$id" params={{ id }}><Pencil className="mr-1 h-4 w-4" /> Izmeni</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => { if (confirm("Obrisati nekretninu?")) del.mutate(); }}>
                  <Trash2 className="mr-1 h-4 w-4" /> Obriši
                </Button>
              </div>
            )}
          </div>

          {/* Osnovni stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Cena" value={formatPrice(p.price)} highlight />
            <Stat label="Površina" value={formatArea(p.area)} icon={<Maximize className="h-4 w-4" />} />
            {p.bedrooms != null && <Stat label="Sobe" value={String(p.bedrooms)} icon={<Bed className="h-4 w-4" />} />}
            {p.bathrooms != null && <Stat label="Kupatila" value={String(p.bathrooms)} icon={<Bath className="h-4 w-4" />} />}
          </div>

          {/* Specifični detalji po tipu */}
          <SpecificDetails p={p} ptype={ptype} />

          {/* Opis */}
          {p.description && (
            <>
              <Separator className="my-8" />
              <h2 className="text-xl font-semibold mb-3">Opis</h2>
              <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">{p.description}</p>
            </>
          )}

          <Separator className="my-8" />
          <CommentsSection propertyId={pid} />
        </div>

        {/* Desna kolona – sidebar */}
        <aside>
          <Card className="sticky top-20 p-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Cena</p>
              <p className="text-3xl font-bold text-accent">{formatPrice(p.price)}</p>
            </div>
            <Separator />
            <div className="text-sm space-y-2 text-muted-foreground">
              {p.ownerEmail && (
                <p>Vlasnik: <span className="text-foreground font-medium">{p.ownerEmail}</span></p>
              )}
              <p>Tip: <span className="text-foreground">{typeLabel(ptype)}</span></p>
              <p>Status: <span className="text-foreground">{statusLabel(p.status)}</span></p>
              <p>Objavljeno: <span className="text-foreground">{formatDate(p.createdAt)}</span></p>
            </div>
            <Separator />
            {isAuthenticated && !mine ? (
              <MessageOwnerDialog propertyId={pid} />
            ) : !isAuthenticated ? (
              <Button asChild className="w-full">
                <Link to="/login">Prijavite se da pošaljete poruku</Link>
              </Button>
            ) : null}
          </Card>
        </aside>
      </div>
    </div>
  );
}

function SpecificDetails({ p, ptype }: { p: PropertyResponse; ptype: string }) {
  const items: { icon: React.ReactNode; label: string; value: string }[] = [];

  if (ptype === "STAN" || ptype === "APARTMAN") {
    if (p.sprat != null) items.push({ icon: <Layers className="h-4 w-4" />, label: "Sprat", value: String(p.sprat) });
    if (p.lift != null) items.push({ icon: <Layers className="h-4 w-4" />, label: "Lift", value: p.lift ? "Da" : "Ne" });
    if (p.grejanje) items.push({ icon: <Flame className="h-4 w-4" />, label: "Grejanje", value: p.grejanje });
    if (p.energetskiRazred) items.push({ icon: <Zap className="h-4 w-4" />, label: "Energetski razred", value: p.energetskiRazred });
  }

  if (ptype === "KUCA" || ptype === "VILA") {
    if (p.povrsinaPlaca != null) items.push({ icon: <TreePine className="h-4 w-4" />, label: "Površina placa", value: formatArea(p.povrsinaPlaca) });
    if (p.brojSpratova != null) items.push({ icon: <Layers className="h-4 w-4" />, label: "Broj spratova", value: String(p.brojSpratova) });
    if (p.bazen != null) items.push({ icon: <Waves className="h-4 w-4" />, label: "Bazen", value: p.bazen ? "Da" : "Ne" });
    if (p.garaza != null) items.push({ icon: <Car className="h-4 w-4" />, label: "Garaža", value: p.garaza ? "Da" : "Ne" });
    if (p.dvoriste != null) items.push({ icon: <Home className="h-4 w-4" />, label: "Dvorište", value: p.dvoriste ? "Da" : "Ne" });
  }

  if (ptype === "ZEMLJISTE") {
    if (p.povrsinaPlaca != null) items.push({ icon: <TreePine className="h-4 w-4" />, label: "Površina placa", value: formatArea(p.povrsinaPlaca) });
    if (p.namena) items.push({ icon: <Home className="h-4 w-4" />, label: "Namena", value: p.namena });
    if (p.prikljucci) items.push({ icon: <Zap className="h-4 w-4" />, label: "Priključci", value: p.prikljucci });
  }

  if (items.length === 0) return null;

  return (
    <>
      <Separator className="my-6" />
      <h2 className="text-xl font-semibold mb-3">Detalji</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border bg-card p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1">{item.icon}{item.label}</p>
            <p className="text-base font-medium mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function Stat({ label, value, highlight, icon }: { label: string; value: string; highlight?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs text-muted-foreground flex items-center gap-1">{icon}{label}</p>
      <p className={highlight ? "text-lg font-bold text-accent" : "text-base font-medium mt-0.5"}>{value}</p>
    </div>
  );
}
