
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

const API_BASE_URL_ACTIVOS = 'https://humble-acorn-4j7wv774w4rg2qj4x-8080.app.github.dev/api/activos';

interface NewActivo {
  nombre: string;
  descripcion: string;
  fechaAdquisicion: string; // YYYY-MM-DD
  valorAdquisicion: string; // String for input, will be parsed to number
  vidaUtilAnios: string;    // String for input, will be parsed to number
  categoria: string;
  estado: string;
}

export default function CrearActivoPage() {
  const [newActivo, setNewActivo] = useState<NewActivo>({
    nombre: '',
    descripcion: '',
    fechaAdquisicion: '',
    valorAdquisicion: '',
    vidaUtilAnios: '',
    categoria: '',
    estado: 'NUEVO',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewActivo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const valorAdquisicionNum = parseFloat(newActivo.valorAdquisicion);
    const vidaUtilAniosNum = parseInt(newActivo.vidaUtilAnios, 10);

    if (!newActivo.nombre || !newActivo.fechaAdquisicion || isNaN(valorAdquisicionNum) || isNaN(vidaUtilAniosNum)) {
      const missingFields = [];
      if (!newActivo.nombre) missingFields.push('Nombre');
      if (!newActivo.fechaAdquisicion) missingFields.push('Fecha de Adquisición');
      if (isNaN(valorAdquisicionNum)) missingFields.push('Valor de Adquisición (debe ser un número)');
      if (isNaN(vidaUtilAniosNum)) missingFields.push('Vida Útil (debe ser un número entero)');
      
      const errorMessage = `Por favor, completa los campos obligatorios: ${missingFields.join(', ')}.`;
      setError(errorMessage);
      setIsLoading(false);
      toast({ title: 'Error de Validación', description: errorMessage, variant: 'destructive' });
      return;
    }
    if (valorAdquisicionNum <= 0) {
        setError('El Valor de Adquisición debe ser un número positivo.');
        setIsLoading(false);
        toast({ title: 'Error de Validación', description: 'Valor de Adquisición debe ser positivo.', variant: 'destructive' });
        return;
    }
    if (vidaUtilAniosNum <= 0) {
        setError('La Vida Útil debe ser un número entero positivo.');
        setIsLoading(false);
        toast({ title: 'Error de Validación', description: 'Vida Útil debe ser positiva.', variant: 'destructive' });
        return;
    }


    const activoPayload = {
        ...newActivo,
        valorAdquisicion: valorAdquisicionNum,
        vidaUtilAnios: vidaUtilAniosNum,
    };

    try {
      const response = await fetch(API_BASE_URL_ACTIVOS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activoPayload),
      });

      if (response.ok || response.status === 201 || response.status === 200) { // Spring puede devolver 200 para POST
        toast({
          title: 'Activo Creado',
          description: `El activo "${newActivo.nombre}" ha sido creado exitosamente.`,
        });
        router.push('/depreciacion/activos');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido al crear activo.' }));
        const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
        setError(errorMessage);
        toast({
          title: 'Error al Crear Activo',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error("Error al crear activo:", err);
      const message = err instanceof Error ? err.message : 'No se pudo conectar al servicio.';
      setError(`Error de red: ${message}`);
      toast({
        title: 'Error de Conexión',
        description: `No se pudo conectar al servicio para crear el activo. ${message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="px-4 sm:px-6 py-2">
        <Button variant="outline" onClick={() => router.back()} className="mb-4 text-amber-700 border-amber-300 hover:bg-amber-50">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Gestión de Activos
        </Button>
        <h1 className="text-xl font-semibold text-amber-800">Registrar Nuevo Activo Fijo</h1>
      </div>
      <main className="flex flex-1 flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Card className="w-full max-w-3xl shadow-lg">
          <CardHeader className="bg-amber-100 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-amber-700 flex items-center">
              <PlusCircle className="mr-3 h-7 w-7" />
              Formulario de Nuevo Activo
            </CardTitle>
            <CardDescription className="text-amber-600">
              Completa los datos para registrar un nuevo activo en el sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-amber-700">Nombre del Activo</Label>
                  <Input id="nombre" name="nombre" type="text" placeholder="Ej: Horno Industrial XYZ" value={newActivo.nombre} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaAdquisicion" className="text-amber-700">Fecha de Adquisición</Label>
                  <Input id="fechaAdquisicion" name="fechaAdquisicion" type="date" value={newActivo.fechaAdquisicion} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-amber-700">Descripción</Label>
                <Textarea id="descripcion" name="descripcion" placeholder="Detalles del activo, modelo, serie, etc." value={newActivo.descripcion} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" rows={3} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="valorAdquisicion" className="text-amber-700">Valor de Adquisición (S/)</Label>
                  <Input id="valorAdquisicion" name="valorAdquisicion" type="number" placeholder="Ej: 5500.50" value={newActivo.valorAdquisicion} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vidaUtilAnios" className="text-amber-700">Vida Útil (Años)</Label>
                  <Input id="vidaUtilAnios" name="vidaUtilAnios" type="number" placeholder="Ej: 5" value={newActivo.vidaUtilAnios} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" step="1" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="categoria" className="text-amber-700">Categoría</Label>
                  <Input id="categoria" name="categoria" type="text" placeholder="Ej: Maquinaria, Mobiliario" value={newActivo.categoria} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-amber-700">Estado</Label>
                  <Input id="estado" name="estado" type="text" placeholder="Ej: NUEVO, USADO" value={newActivo.estado} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
              </div>

              {error && (
                <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
                  <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              <Button type="submit" className="w-full text-lg py-3 bg-amber-600 hover:bg-amber-700 text-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Registrando Activo...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Registrar Activo
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-xs text-amber-600 p-4 bg-amber-50 rounded-b-lg">
              <p>Asegúrate de ingresar la información correcta y completa del activo.</p>
          </CardFooter>
        </Card>
      </main>
    </>
  );
}
