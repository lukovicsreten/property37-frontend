import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, LogOut, MessageSquare, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { messagesApi } from "@/lib/api/endpoints";
import { Badge } from "@/components/ui/badge";

export function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const { data: unread } = useQuery({
    queryKey: ["unread-count"],
    queryFn: () => messagesApi.unreadCount(),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
  const unreadNum = unread ? Number(unread.count ?? unread.unread ?? unread.unreadCount ?? Object.values(unread)[0] ?? 0) : 0;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-primary">
          <Building2 className="h-6 w-6 text-accent" />
          <span className="text-lg tracking-tight">Property37</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" activeOptions={{ exact: true }} className="text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>
            Početna
          </Link>
          <Link to="/properties" className="text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>
            Pretraga
          </Link>
          {isAuthenticated && (
            <Link to="/my-listings" className="text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground font-medium" }}>
              Moje nekretnine
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button asChild size="sm" variant="default">
                <Link to="/new-property"><Plus className="mr-1 h-4 w-4" /> Objavi</Link>
              </Button>
              <Button asChild size="icon" variant="ghost" className="relative">
                <Link to="/messages">
                  <MessageSquare className="h-5 w-5" />
                  {unreadNum > 0 && (
                    <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full bg-accent px-1 text-[10px] text-accent-foreground">
                      {unreadNum}
                    </Badge>
                  )}
                </Link>
              </Button>
              <div className="hidden items-center gap-2 sm:flex">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{user?.email}</span>
              </div>
              <Button size="icon" variant="ghost" onClick={() => { logout(); navigate({ to: "/" }); }} title="Odjava">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost"><Link to="/login">Prijava</Link></Button>
              <Button asChild size="sm"><Link to="/register">Registracija</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-secondary/30 mt-16">
      <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground flex flex-col gap-2 md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} Property37. Sva prava zadržana.</p>
        <p>Platforma za nekretnine.</p>
      </div>
    </footer>
  );
}