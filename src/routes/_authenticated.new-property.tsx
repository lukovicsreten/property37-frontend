import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PropertyForm } from "@/components/PropertyForm";
import { typeLabel } from "@/lib/format";
import type { PropertyType } from "@/lib/api/types";
import { Building, Hotel, Home, Castle, Trees } from "lucide-react";

export const Route = createFileRoute("/_authenticated/new-property")({ component: NewPropertyPage });

const TYPES: { type: PropertyType; icon: React.ReactNode; desc: string }[] = [
  { type: "STAN", icon: <Building className="h-6 w-6" />, desc: "Stan u stambenoj zgradi" },
  { type: "APARTMAN", icon: <Hotel className="h-6 w-6" />, desc: "Apartman za boravak" },
  { type: "KUCA", icon: <Home className="h-6 w-6" />, desc: "Porodična kuća" },
  { type: "VILA", icon: <Castle className="h-6 w-6" />, desc: "Vila sa placem" },
  { type: "ZEMLJISTE", icon: <Trees className="h-6 w-6" />, desc: "Plac / zemljište" },
];

function NewPropertyPage() {
  const [picked, setPicked] = useState<PropertyType | null>(null);
  const navigate = useNavigate();

  if (!picked) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight">Objavi nekretninu</h1>
        <p className="text-muted-foreground mt-1">Izaberite tip nekretnine.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TYPES.map((t) => (
            <button key={t.type} onClick={() => setPicked(t.type)} className="text-left">
              <Card className="p-6 h-full hover:border-accent hover:shadow-md transition-all">
                <div className="text-accent">{t.icon}</div>
                <h3 className="mt-3 font-semibold">{typeLabel(t.type)}</h3>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </Card>
            </button>
          ))}
        </div>
        <Button variant="ghost" className="mt-4" onClick={() => navigate({ to: "/" })}>← Otkaži</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" size="sm" onClick={() => setPicked(null)}>← Promeni tip</Button>
      <h1 className="text-3xl font-semibold tracking-tight mt-2">Nova: {typeLabel(picked)}</h1>
      <div className="mt-6">
        <PropertyForm type={picked} />
      </div>
    </div>
  );
}