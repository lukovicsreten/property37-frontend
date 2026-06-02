import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Maximize } from "lucide-react";
import { formatPrice, formatArea, statusLabel, typeLabel } from "@/lib/format";
import type { PropertyResponse, PropertyType } from "@/lib/api/types";
import { propertyTypeOf } from "@/lib/api/property-utils";

export function PropertyCard({ p }: { p: PropertyResponse }) {
  const title = p.title ?? typeLabel(propertyTypeOf(p));
  const loc = p.location;
  const bedrooms = p.bedrooms;
  const img = p.imageUrls?.[0] ?? p.imageUrl ?? `https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&q=70&sig=${p.id}`;
  const pType = propertyTypeOf(p) as PropertyType | undefined;
  return (
    <Link to="/properties/$id" params={{ id: String(p.id) }} className="group">
      <Card className="overflow-hidden transition-all hover:shadow-lg border-border/60 pt-0">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img src={img} alt={title} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
          <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">{statusLabel(p.status)}</Badge>
          {pType && (
            <Link
              to="/properties/"
              search={{ propertyType: pType, sortBy: "createdAt", sortDir: "desc", page: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-3 top-3"
            >
              <Badge
                variant="secondary"
                className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
              >
                {typeLabel(pType)}
              </Badge>
            </Link>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-foreground line-clamp-1">{title}</h3>
          {loc && (
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {String(loc).replaceAll("_", " ")}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
            <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" /> {formatArea(p.area)}</span>
            {bedrooms !== undefined && <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {bedrooms} soba</span>}
          </div>
          <p className="text-xl font-bold text-accent pt-1">{formatPrice(p.price)}</p>
        </div>
      </Card>
    </Link>
  );
}