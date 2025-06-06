
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, TrendingDown, DollarSign, CalendarDays } from 'lucide-react';
import Image from 'next/image';

export default function DepreciacionPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      <Card className="w-full max-w-4xl shadow-2xl border-2 border-amber-300">
        <CardHeader className="text-center bg-amber-100 rounded-t-lg p-8">
          <div className="mx-auto mb-6">
             <Image 
                src="https://placehold.co/120x120.png" 
                alt="Polleria Logo" 
                width={120} 
                height={120} 
                className="rounded-full border-4 border-amber-500 shadow-lg"
                data-ai-hint="roast chicken" 
            />
          </div>
          <CardTitle className="text-4xl font-bold text-amber-700 flex items-center justify-center">
            <Building className="mr-3 h-10 w-10" />
            Gestión de Depreciación de Activos
          </CardTitle>
          <CardDescription className="text-lg text-amber-600 mt-2">
            Herramienta para el cálculo y seguimiento de la depreciación de activos de su pollería.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-amber-700 mb-4">¡Bienvenido!</h2>
            <p className="text-muted-foreground text-lg">
              Esta sección está en desarrollo. Próximamente podrá gestionar aquí la depreciación de sus activos:
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-amber-50 rounded-lg shadow-md border border-amber-200">
              <DollarSign className="h-12 w-12 text-amber-600 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-amber-700">Registro de Activos</h3>
              <p className="text-sm text-muted-foreground">Añada y clasifique sus hornos, freidoras, vehículos, etc.</p>
            </div>
            <div className="p-6 bg-amber-50 rounded-lg shadow-md border border-amber-200">
              <TrendingDown className="h-12 w-12 text-amber-600 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-amber-700">Cálculo de Depreciación</h3>
              <p className="text-sm text-muted-foreground">Aplique métodos de depreciación y vea los valores actualizados.</p>
            </div>
            <div className="p-6 bg-amber-50 rounded-lg shadow-md border border-amber-200">
              <CalendarDays className="h-12 w-12 text-amber-600 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-amber-700">Reportes y Seguimiento</h3>
              <p className="text-sm text-muted-foreground">Genere informes periódicos del estado de sus activos.</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-amber-500">
              Para regresar, por favor cierre sesión o navegue directamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
