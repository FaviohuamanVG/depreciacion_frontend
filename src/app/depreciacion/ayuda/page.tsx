
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HelpCircle, BookOpen } from 'lucide-react';

export default function AyudaPage() {
  return (
    <>
      <div className="px-4 sm:px-6 py-2">
        <h1 className="text-xl font-semibold text-amber-800">Centro de Ayuda</h1>
      </div>
      <main className="flex flex-1 flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Card className="w-full max-w-3xl shadow-lg">
          <CardHeader className="bg-amber-100 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-amber-700 flex items-center">
              <BookOpen className="mr-3 h-7 w-7" />
              Guía de Usuario del Sistema de Depreciación
            </CardTitle>
            <CardDescription className="text-amber-600">
              Encuentra aquí información sobre cómo utilizar las funcionalidades del sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-amber-700 mb-2 flex items-center">
                <HelpCircle className="mr-2 h-6 w-6" />
                Introducción
              </h2>
              <p className="text-muted-foreground">
                Bienvenido al sistema de gestión de depreciación de activos para pollerías. Esta herramienta está diseñada para ayudarte a registrar, calcular y seguir la depreciación de tus activos fijos.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-amber-700 mb-1">Sección Dashboard:</h3>
              <p className="text-muted-foreground">
                El Dashboard te ofrece una vista general del estado de tus activos y los cálculos de depreciación. Aquí encontrarás resúmenes y accesos directos a las principales funcionalidades. (Contenido en construcción)
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-amber-700 mb-1">Sección Activos:</h3>
              <p className="text-muted-foreground">
                En esta sección podrás agregar nuevos activos (hornos, freidoras, vehículos, etc.), editar la información de los existentes, y ver un listado completo. Cada activo tendrá detalles como fecha de adquisición, costo, vida útil, etc. (Contenido en construcción)
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-amber-700 mb-1">Sección Reportes:</h3>
              <p className="text-muted-foreground">
                Aquí podrás generar diversos reportes sobre la depreciación de tus activos, como el valor en libros, depreciación acumulada, y proyecciones. (Contenido en construcción)
              </p>
            </section>
            
            <div className="mt-6 border-2 border-dashed border-amber-300 rounded-lg p-10 text-center text-amber-500">
              <p>Esta guía está en desarrollo. Pronto añadiremos más detalles y tutoriales.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
