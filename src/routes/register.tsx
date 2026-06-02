import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { authApi } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/register")({ component: RegisterPage });

function RegisterPage() {
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", fullName: "", phone: "" });

  const m = useMutation({
    mutationFn: () => authApi.register(form),
    onSuccess: (data) => {
      setToken(data.token);
      toast.success("Nalog je kreiran");
      navigate({ to: "/" });
    },
    onError: (e: Error) => toast.error(e.message || "Registracija neuspela"),
  });

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Registracija</h1>
        <p className="text-sm text-muted-foreground mt-1">Otvorite nalog i objavljujte nekretnine.</p>
        <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="fullName">Ime i prezime</Label>
            <Input id="fullName" value={form.fullName} onChange={upd("fullName")} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={form.email} onChange={upd("email")} />
          </div>
          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" value={form.phone} onChange={upd("phone")} />
          </div>
          <div>
            <Label htmlFor="password">Lozinka</Label>
            <Input id="password" type="password" required minLength={6} value={form.password} onChange={upd("password")} />
          </div>
          <Button type="submit" className="w-full" disabled={m.isPending}>
            {m.isPending ? "Kreiranje…" : "Registruj se"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground text-center">
          Već imate nalog? <Link to="/login" className="text-accent font-medium">Prijavite se</Link>
        </p>
      </Card>
    </div>
  );
}