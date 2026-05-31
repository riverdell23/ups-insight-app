import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Library, ClipboardList, Shield, LogOut, Zap } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

const items = [
  
  { title: "UPS Library", url: "/app/library", icon: Library },
  
  { title: "Enquiry Checklist", url: "/app/checklist", icon: ClipboardList },
];

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/app" className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent">
            <Zap className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-sm font-semibold leading-tight">UPS</span>
            <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Wonderbook</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={path === item.url}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={path.startsWith("/app/admin")}>
                    <Link to="/app/admin">
                      <Shield className="h-4 w-4" />
                      <span>Admin Console</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-2 text-xs text-sidebar-foreground/70 truncate">{user?.email}</div>
        <SidebarMenuButton onClick={handleLogout}>
          <LogOut className="h-4 w-4" /> <span>Sign out</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
