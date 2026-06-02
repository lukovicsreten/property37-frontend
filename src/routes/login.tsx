import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { authApi } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: (s.redirect as string) || "/" }),
  component: LoginPage,
});

function LoginPage() {
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const m = useMutation({
    mutationFn: () => authApi.login({ email, password }),
    onSuccess: (data) => {
      setToken(data.token);
      toast.success("Uspešno ste prijavljeni");
      navigate({ to: search.redirect });
    },
    onError: (e: Error) => toast.error(e.message || "Neuspešna prijava"),
  });

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Prijava</h1>
        <p className="text-sm text-muted-foreground mt-1">Pristupite svom Property37 nalogu.</p>
        <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Lozinka</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={m.isPending}>
            {m.isPending ? "Prijava…" : "Prijavi se"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground text-center">
          Nemate nalog? <Link to="/register" className="text-accent font-medium">Registrujte se</Link>
        </p>
      </Card>
    </div>
  );
}