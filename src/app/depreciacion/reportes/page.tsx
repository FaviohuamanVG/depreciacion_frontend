
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function ReportesPage() {
  return (
    <>
      <div className="px-4 sm:px-6 py-2"> {/* Removed flex-1 */}
        <h1 className="text-xl font-semibold text-amber-800">Reportes de Depreciación</h1>
      </div>
      <main className="flex flex-1 flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"> {/* Removed justify-start and min-h */}
        <Card className="w-full max-w-3xl shadow-lg">
          <CardHeader className="bg-amber-100 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-amber-700 flex items-center">
              <FileText className="mr-3 h-7 w-7" />
              Generación de Reportes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Desde esta sección podrá generar y visualizar reportes sobre la depreciación de los activos.
              Esta sección está en construcción.
            </p>
            {/* Placeholder para opciones de reportes */}
            <div className="mt-6 border-2 border-dashed border-amber-300 rounded-lg p-10 text-center text-amber-500">
              <p>Próximamente: Opciones de generación de reportes aquí.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
