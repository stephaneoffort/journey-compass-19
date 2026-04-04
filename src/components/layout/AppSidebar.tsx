import { Home, Briefcase, Plus, Calendar, Map, Plane, Sun, Moon, Shield } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { UserMenu } from './UserMenu';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';

const navItems = [
  { title: 'Accueil', url: '/', icon: Home },
  { title: 'Voyages', url: '/voyages', icon: Briefcase },
  { title: 'Nouveau voyage', url: '/add', icon: Plus },
  { title: 'Calendrier', url: '/calendar', icon: Calendar },
  { title: 'Carte', url: '/map', icon: Map },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isAdmin } = useUserRole();

  const isActive = (path: string) => location.pathname === path;

  const allNavItems = [
    ...navItems,
    ...(isAdmin ? [{ title: 'Administration', url: '/admin/roles', icon: Shield }] : []),
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Plane className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg font-display tracking-tight">
              TripTracker
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={collapsed ? item.title : undefined}
                  >
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-2">
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'default'}
          onClick={toggleTheme}
          className="w-full justify-start gap-3"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 shrink-0" />
          ) : (
            <Moon className="h-5 w-5 shrink-0" />
          )}
          {!collapsed && (
            <span>{theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</span>
          )}
        </Button>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
