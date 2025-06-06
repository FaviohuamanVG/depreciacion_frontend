
'use client';

import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Building, TrendingDown, DollarSign, CalendarDays, LogOut, LayoutDashboard, Archive, FileText } from 'lucide-react';
import type { ReactNode } from 'react';

export default function DepreciacionLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    router.push('/');
  };

  const menuItems = [
    {
      path: '/depreciacion',
      icon: <LayoutDashboard />,
      label: 'Dashboard',
      tooltip: 'Dashboard',
    },
    {
      path: '/depreciacion/activos',
      icon: <Archive />,
      label: 'Activos',
      tooltip: 'Gestión de Activos',
    },
    {
      path: '/depreciacion/reportes',
      icon: <FileText />,
      label: 'Reportes',
      tooltip: 'Reportes',
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-3">
          <div className="flex items-center gap-2 justify-center group-data-[collapsible=icon]:justify-center">
            <Image
              src="https://placehold.co/40x40.png"
              alt="Polleria Mini Logo"
              width={40}
              height={40}
              className="rounded-md"
              data-ai-hint="chicken logo"
            />
            <h2 className="text-lg font-semibold text-sidebar-primary group-data-[collapsible=icon]:hidden">
              Pollería Gestión
            </h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  onClick={() => router.push(item.path)}
                  tooltip={item.tooltip}
                  isActive={pathname === item.path || (item.path === '/depreciacion' && pathname === '/depreciacion/')}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Cerrar Sesión">
                <LogOut />
                <span>Cerrar Sesión</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="md:hidden" /> {/* Hamburger for mobile */}
          <div className="flex-1">
            {/* El título específico de la página se renderizará por cada page.tsx */}
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
