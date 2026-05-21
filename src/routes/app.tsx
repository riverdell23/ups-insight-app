import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { DISCLAIMER } from "@/lib/ups";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border bg-card px-4 sticky top-0 z-30">
            <SidebarTrigger />
            <div className="text-sm text-muted-foreground hidden md:block">DC UPS Benchmark — Consultant workspace</div>
          </header>
          <main className="flex-1 p-6 lg:p-8 overflow-x-auto">
            <Outlet />
          </main>
          <footer className="border-t border-border px-6 py-3 text-[11px] text-muted-foreground bg-muted/40">
            <strong>Disclaimer:</strong> {DISCLAIMER}
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
