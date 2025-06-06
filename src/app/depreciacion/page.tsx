
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, TrendingDown, DollarSign, CalendarDays } from 'lucide-react';

export default function DepreciacionDashboardPage() {
  return (
    <>
      <div className="flex-1 px-4 sm:px-6 py-2">
         <h1 className="text-xl font-semibold text-amber-800">Panel Principal (Dashboard)</h1>
      </div>
      <main className="flex flex-1 flex-col items-center justify-start p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 min-h-[calc(100vh-3.5rem-2.5rem)]">
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
          </CardContent>
        </Card>
      </main>
    </>
  );
}
