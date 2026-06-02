import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { propertiesApi, locationsApi } from "@/lib/api/endpoints";
import type { PropertyResponse, PropertyType, PropertyStatus } from "@/lib/api/types";

const MAX_IMAGES = 20;

type FormState = {
  title: string;
  description: string;
  price: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  location: string;
  status: PropertyStatus;
  imageUrls: string[];
  sprat: string;
  lift: boolean;
  grejanje: string;
  energetskiRazred: string;
  brojSpratova: string;
  povrsinaPlaca: string;
  bazen: boolean;
  garaza: boolean;
  dvoriste: boolean;
  namena: string;
  prikljucci: string;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  price: "",
  area: "",
  bedrooms: "2",
  bathrooms: "1",
  location: "",
  status: "AVAILABLE",
  imageUrls: [],
  sprat: "",
  lift: false,
  grejanje: "",
  energetskiRazred: "",
  brojSpratova: "",
  povrsinaPlaca: "",
  bazen: false,
  garaza: false,
  dvoriste: false,
  namena: "",
  prikljucci: "",
};

export function PropertyForm({ type, existing }: { type: PropertyType; existing?: PropertyResponse }) {
  const navigate = useNavigate();
  const { data: locations } = useQuery({ queryKey: ["locations"], queryFn: () => locationsApi.getAll() });
  const [f, setF] = useState<FormState>(emptyForm);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - f.imageUrls.length;
    if (remaining <= 0) {
      toast.error(`Maksimalan broj slika je ${MAX_IMAGES}`);
      return;
    }
    const toProcess = files.slice(0, remaining);
    const oversized = toProcess.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error(`${oversized.length} slika je veće od 5MB i biće preskočeno`);
    }
    const valid = toProcess.filter((file) => file.size <= 5 * 1024 * 1024);
    if (!valid.length) return;

    let loaded = 0;
    const results: string[] = Array(valid.length);
    valid.forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = () => {
        results[i] = reader.result as string;
        loaded++;
        if (loaded === valid.length) {
          setF((s) => ({ ...s, imageUrls: [...s.imageUrls, ...results] }));
        }
      };
      reader.readAsDataURL(file);
    });
    // reset input so same files can be re-selected if needed
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    setF((s) => ({ ...s, imageUrls: s.imageUrls.filter((_, i) => i !== idx) }));
  };

  useEffect(() => {
    if (existing) {
      setF({
        title: existing.title,
        description: existing.description,
        price: String(existing.price),
        area: String(existing.area),
        bedrooms: String(existing.bedrooms),
        bathrooms: String(existing.bathrooms ?? 1),
        location: existing.location,
        status: existing.status,
        imageUrls: existing.imageUrls?.length ? existing.imageUrls : (existing.imageUrl ? [existing.imageUrl] : []),
        sprat: String(existing.sprat ?? ""),
        lift: !!existing.lift,
        grejanje: existing.grejanje ?? "",
        energetskiRazred: existing.energetskiRazred ?? "",
        brojSpratova: String(existing.brojSpratova ?? ""),
        povrsinaPlaca: String(existing.povrsinaPlaca ?? ""),
        bazen: !!existing.bazen,
        garaza: !!existing.garaza,
        dvoriste: !!existing.dvoriste,
        namena: existing.namena ?? "",
        prikljucci: existing.prikljucci ?? "",
      });
    }
  }, [existing]);

  const buildPayload = () => {
    const base = {
      title: f.title,
      description: f.description,
      price: Number(f.price),
      area: Number(f.area),
      bedrooms: Number(f.bedrooms) || 1,
      bathrooms: Number(f.bathrooms) || 1,
      location: f.location,
      status: f.status,
      imageUrl: f.imageUrls[0] || undefined,
      imageUrls: f.imageUrls,
    };
    switch (type) {
      case "STAN":
      case "APARTMAN":
        return {
          ...base,
          sprat: f.sprat ? Number(f.sprat) : undefined,
          lift: f.lift,
          grejanje: f.grejanje || undefined,
          energetskiRazred: f.energetskiRazred || undefined,
        };
      case "KUCA":
      case "VILA":
        return {
          ...base,
          povrsinaPlaca: Number(f.povrsinaPlaca),
          brojSpratova: f.brojSpratova ? Number(f.brojSpratova) : undefined,
          bazen: f.bazen,
          garaza: f.garaza,
          dvoriste: f.dvoriste,
        };
      case "ZEMLJISTE":
        return {
          ...base,
          povrsinaPlaca: Number(f.povrsinaPlaca),
          namena: f.namena || undefined,
          prikljucci: f.prikljucci || undefined,
        };
    }
  };

  const m = useMutation({
    mutationFn: async () => {
      const p = buildPayload() as never;
      const id = existing?.id;
      if (id) {
        switch (type) {
          case "STAN":
            return propertiesApi.updateStan(id, p);
          case "APARTMAN":
            return propertiesApi.updateApartman(id, p);
          case "KUCA":
            return propertiesApi.updateKuca(id, p);
          case "VILA":
            return propertiesApi.updateVila(id, p);
          case "ZEMLJISTE":
            return propertiesApi.updateZemljiste(id, p);
        }
      }
      switch (type) {
        case "STAN":
          return propertiesApi.createStan(p);
        case "APARTMAN":
          return propertiesApi.createApartman(p);
        case "KUCA":
          return propertiesApi.createKuca(p);
        case "VILA":
          return propertiesApi.createVila(p);
        case "ZEMLJISTE":
          return propertiesApi.createZemljiste(p);
      }
    },
    onSuccess: (res) => {
      toast.success(existing ? "Sačuvano" : "Objavljeno");
      if (res) navigate({ to: "/properties/$id", params: { id: String(res.id) } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const upd = <K extends keyof FormState>(k: K) => (v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));
  const needsPlaca = type === "KUCA" || type === "VILA" || type === "ZEMLJISTE";

  return (
    <Card className="p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (needsPlaca && !f.povrsinaPlaca) {
            toast.error("Povrsina placa je obavezna");
            return;
          }
          m.mutate();
        }}
        className="space-y-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Naslov *</Label>
            <Input required value={f.title} onChange={(e) => upd("title")(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Opis</Label>
            <Textarea rows={4} value={f.description} onChange={(e) => upd("description")(e.target.value)} />
          </div>
          <div>
            <Label>Cena (EUR) *</Label>
            <Input type="number" required min={0} value={f.price} onChange={(e) => upd("price")(e.target.value)} />
          </div>
          <div>
            <Label>Povrsina (m2) *</Label>
            <Input type="number" required min={0} step="0.1" value={f.area} onChange={(e) => upd("area")(e.target.value)} />
          </div>
          <div>
            <Label>Broj soba *</Label>
            <Input type="number" required min={1} value={f.bedrooms} onChange={(e) => upd("bedrooms")(e.target.value)} />
          </div>
          <div>
            <Label>Kupatila *</Label>
            <Input type="number" required min={1} value={f.bathrooms} onChange={(e) => upd("bathrooms")(e.target.value)} />
          </div>
          <div>
            <Label>Status *</Label>
            <Select value={f.status} onValueChange={(v) => upd("status")(v as PropertyStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AVAILABLE">Dostupno</SelectItem>
                <SelectItem value="SOLD">Prodata</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Lokacija *</Label>
            <Select value={f.location} onValueChange={upd("location")}>
              <SelectTrigger><SelectValue placeholder="Izaberi lokaciju" /></SelectTrigger>
              <SelectContent>
                {locations?.map((l) => (
                  <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <Label>Slike ({f.imageUrls.length}/{MAX_IMAGES})</Label>
              {f.imageUrls.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 text-xs text-accent hover:underline"
                >
                  <ImagePlus className="h-3.5 w-3.5" /> Dodaj slike
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageChange}
            />
            {f.imageUrls.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {f.imageUrls.map((src, idx) => (
                  <div key={idx} className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                    <img src={src} alt={`Slika ${idx + 1}`} className="h-full w-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[10px] text-white">Naslovna</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {f.imageUrls.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                  >
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-xs">Dodaj</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 py-8 text-muted-foreground hover:border-accent hover:text-accent transition-colors"
              >
                <ImagePlus className="h-8 w-8" />
                <span className="text-sm font-medium">Klikni da izabereš slike</span>
                <span className="text-xs">PNG, JPG, WEBP · do 5MB po slici · max {MAX_IMAGES} slika</span>
              </button>
            )}
          </div>
          {(type === "STAN" || type === "APARTMAN") && (
            <>
              <div>
                <Label>Sprat</Label>
                <Input type="number" min={0} value={f.sprat} onChange={(e) => upd("sprat")(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <Checkbox id="lift" checked={f.lift} onCheckedChange={(v) => upd("lift")(!!v)} />
                <Label htmlFor="lift">Lift</Label>
              </div>
              <div>
                <Label>Grejanje</Label>
                <Input value={f.grejanje} onChange={(e) => upd("grejanje")(e.target.value)} />
              </div>
              <div>
                <Label>Energetski razred</Label>
                <Input value={f.energetskiRazred} onChange={(e) => upd("energetskiRazred")(e.target.value)} />
              </div>
            </>
          )}
          {(type === "KUCA" || type === "VILA") && (
            <>
              <div>
                <Label>Povrsina placa (m2) *</Label>
                <Input type="number" required min={0} value={f.povrsinaPlaca} onChange={(e) => upd("povrsinaPlaca")(e.target.value)} />
              </div>
              <div>
                <Label>Broj spratova</Label>
                <Input type="number" min={0} value={f.brojSpratova} onChange={(e) => upd("brojSpratova")(e.target.value)} />
              </div>
              <div className="flex flex-wrap gap-4 sm:col-span-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="bazen" checked={f.bazen} onCheckedChange={(v) => upd("bazen")(!!v)} />
                  <Label htmlFor="bazen">Bazen</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="garaza" checked={f.garaza} onCheckedChange={(v) => upd("garaza")(!!v)} />
                  <Label htmlFor="garaza">Garaza</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="dvoriste" checked={f.dvoriste} onCheckedChange={(v) => upd("dvoriste")(!!v)} />
                  <Label htmlFor="dvoriste">Dvoriste</Label>
                </div>
              </div>
            </>
          )}
          {type === "ZEMLJISTE" && (
            <>
              <div>
                <Label>Povrsina placa (m2) *</Label>
                <Input type="number" required min={0} value={f.povrsinaPlaca} onChange={(e) => upd("povrsinaPlaca")(e.target.value)} />
              </div>
              <div>
                <Label>Namena</Label>
                <Input value={f.namena} onChange={(e) => upd("namena")(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label>Prikljucci</Label>
                <Input value={f.prikljucci} onChange={(e) => upd("prikljucci")(e.target.value)} />
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button type="button" variant="ghost" onClick={() => navigate({ to: "/properties" })}>Otkazi</Button>
          <Button type="submit" disabled={m.isPending}>{m.isPending ? "Cuvanje..." : existing ? "Sacuvaj" : "Objavi"}</Button>
        </div>
      </form>
    </Card>
  );
}