
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive } from 'lucide-react';

export default function ActivosPage() {
  return (
    <>
      <div className="flex-1 px-4 sm:px-6 py-2">
        <h1 className="text-xl font-semibold text-amber-800">Gestión de Activos</h1>
      </div>
      <main className="flex flex-1 flex-col items-center justify-start p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 min-h-[calc(100vh-3.5rem-2.5rem)]">
        <Card className="w-full max-w-3xl shadow-lg">
          <CardHeader className="bg-amber-100 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-amber-700 flex items-center">
              <Archive className="mr-3 h-7 w-7" />
              Listado de Activos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              Aquí podrá ver, agregar, editar y eliminar los activos de la pollería.
              Esta sección está en construcción.
            </p>
            {/* Placeholder para la tabla o lista de activos */}
            <div className="mt-6 border-2 border-dashed border-amber-300 rounded-lg p-10 text-center text-amber-500">
              <p>Próximamente: Tabla de activos aquí.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
