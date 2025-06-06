
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function DepreciacionDashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    // Potentially clear any session/token here if you implement actual auth later
    router.push('/');
  };

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
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Dashboard">
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Gestión de Activos">
                <Archive />
                <span>Activos</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Reportes">
                <FileText />
                <span>Reportes</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
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
            <h1 className="text-xl font-semibold text-amber-800">Panel de Depreciación</h1>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-start p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 min-h-[calc(100vh-3.5rem)]">
          <Card className="w-full max-w-5xl shadow-2xl border-2 border-amber-300">
            <CardHeader className="text-center bg-amber-100 rounded-t-lg p-6 sm:p-8">
              <div className="mx-auto mb-4 sm:mb-6">
                 <Image 
                    src="https://placehold.co/100x100.png" 
                    alt="Polleria Logo" 
                    width={100} 
                    height={100} 
                    className="rounded-full border-4 border-amber-500 shadow-lg"
                    data-ai-hint="roast chicken" 
                />
              </div>
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-700 flex items-center justify-center">
                <Building className="mr-2 sm:mr-3 h-7 w-7 sm:h-8 md:h-10 md:w-10" />
                Gestión de Depreciación de Activos
              </CardTitle>
              <CardDescription className="text-base sm:text-lg text-amber-600 mt-2">
                Herramienta para el cálculo y seguimiento de la depreciación de activos de su pollería.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6 sm:space-y-8">
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-semibold text-amber-700 mb-4">¡Bienvenido al Dashboard!</h2>
                <p className="text-muted-foreground text-base sm:text-lg">
                  Esta sección está en desarrollo. Desde aquí podrá gestionar la depreciación de sus activos:
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 sm:gap-6 text-center">
                <div className="p-4 sm:p-6 bg-amber-50 rounded-lg shadow-md border border-amber-200">
                  <DollarSign className="h-10 w-10 sm:h-12 sm:w-12 text-amber-600 mx-auto mb-3" />
                  <h3 className="text-lg sm:text-xl font-semibold text-amber-700">Registro de Activos</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Añada y clasifique sus hornos, freidoras, vehículos, etc.</p>
                </div>
                <div className="p-4 sm:p-6 bg-amber-50 rounded-lg shadow-md border border-amber-200">
                  <TrendingDown className="h-10 w-10 sm:h-12 sm:w-12 text-amber-600 mx-auto mb-3" />
                  <h3 className="text-lg sm:text-xl font-semibold text-amber-700">Cálculo de Depreciación</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Aplique métodos de depreciación y vea los valores actualizados.</p>
                </div>
                <div className="p-4 sm:p-6 bg-amber-50 rounded-lg shadow-md border border-amber-200">
                  <CalendarDays className="h-10 w-10 sm:h-12 sm:w-12 text-amber-600 mx-auto mb-3" />
                  <h3 className="text-lg sm:text-xl font-semibold text-amber-700">Reportes y Seguimiento</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Genere informes periódicos del estado de sus activos.</p>
                </div>
              </div>
              {/* El mensaje de "Para regresar, cierre sesión" ha sido eliminado ya que el logout está en el sidebar */}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
