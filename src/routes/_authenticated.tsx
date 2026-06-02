import { createFileRoute, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { tokenStore } from "@/lib/api/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    // Token is stored client-side; on first SSR pass we cannot inspect localStorage,
    // so the check is also enforced in the component for hydration.
    if (typeof window !== "undefined" && !tokenStore.get()) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated && !tokenStore.get()) {
      navigate({ to: "/login", search: { redirect: loc.href } });
    }
  }, [isAuthenticated, navigate, loc.href]);
  return <Outlet />;
}