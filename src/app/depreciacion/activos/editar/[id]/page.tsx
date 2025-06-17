
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, AlertCircle, ArrowLeft, Loader2, Edit3 } from 'lucide-react';

const API_BASE_URL_ACTIVOS = 'https://humble-acorn-4j7wv774w4rg2qj4x-8080.app.github.dev/api/activos';

interface ActivoEditable {
  id: string;
  nombre: string;
  descripcion: string;
  fechaAdquisicion: string; // YYYY-MM-DD
  valorAdquisicion: string; // String for input, parsed to number
  vidaUtilAnios: string;    // String for input, parsed to number
  categoria: string;
  estado: string;
}

export default function EditarActivoPage() {
  const router = useRouter();
  const params = useParams();
  const activoId = params.id as string;

  const [activo, setActivo] = useState<ActivoEditable | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!activoId) {
      setError('ID de activo no encontrado.');
      setIsFetching(false);
      toast({ title: 'Error', description: 'No se proporcionó un ID de activo.', variant: 'destructive' });
      router.push('/depreciacion/activos');
      return;
    }

    const fetchActivoDetails = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL_ACTIVOS}/${activoId}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error('Activo no encontrado.');
          const errorData = await response.json().catch(() => ({ message: `Error ${response.status}: ${response.statusText}` }));
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        // Convert numeric fields to string for form inputs
        setActivo({
            ...data,
            valorAdquisicion: data.valorAdquisicion?.toString() || '',
            vidaUtilAnios: data.vidaUtilAnios?.toString() || '',
            // Asegurar que los campos opcionales string no sean null
            descripcion: data.descripcion || '',
            categoria: data.categoria || '',
            estado: data.estado || '',
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo obtener los detalles del activo.';
        setError(message);
        toast({
          title: 'Error al Cargar Activo',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchActivoDetails();
  }, [activoId, router, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!activo) return;
    const { name, value } = e.target;
    setActivo(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!activo) {
      setError('No hay datos de activo para actualizar.');
      return;
    }
    setError(null);
    setIsLoading(true);

    const valorAdquisicionNum = parseFloat(activo.valorAdquisicion);
    const vidaUtilAniosNum = parseInt(activo.vidaUtilAnios, 10);

    if (!activo.nombre || !activo.fechaAdquisicion || isNaN(valorAdquisicionNum) || isNaN(vidaUtilAniosNum)) {
      const missingFields = [];
      if (!activo.nombre) missingFields.push('Nombre');
      if (!activo.fechaAdquisicion) missingFields.push('Fecha de Adquisición');
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

    const { id, ...updatePayloadRest } = activo;
    const activoPayload = {
        ...updatePayloadRest,
        valorAdquisicion: valorAdquisicionNum,
        vidaUtilAnios: vidaUtilAniosNum,
    };

    try {
      const response = await fetch(`${API_BASE_URL_ACTIVOS}/${activo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activoPayload),
      });

      if (response.ok || response.status === 200) { // Spring suele devolver 200 para PUT con cuerpo
        toast({
          title: 'Activo Actualizado',
          description: `El activo "${activo.nombre}" ha sido actualizado exitosamente.`,
        });
        router.push('/depreciacion/activos');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido al actualizar activo.' }));
        const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
        setError(errorMessage);
        toast({
          title: 'Error al Actualizar Activo',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error("Error al actualizar activo:", err);
      const message = err instanceof Error ? err.message : 'No se pudo conectar al servicio.';
      setError(`Error de red: ${message}`);
      toast({
        title: 'Error de Conexión',
        description: `No se pudo conectar al servicio para actualizar el activo. ${message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-1 justify-center items-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
        <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
        <p className="ml-4 text-amber-600">Cargando datos del activo...</p>
      </div>
    );
  }

  if (error && !activo) {
     return (
      <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="bg-red-100 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-red-700 flex items-center">
              <AlertCircle className="mr-3 h-7 w-7" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
            <Button variant="outline" onClick={() => router.push('/depreciacion/activos')} className="mt-4 text-amber-700 border-amber-300 hover:bg-amber-50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Listado de Activos
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }
  
  if (!activo) {
    return (
        <div className="flex flex-1 justify-center items-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
            <p className="text-amber-700">No se encontraron datos del activo para editar.</p>
            <Button variant="link" onClick={() => router.push('/depreciacion/activos')} className="mt-2">Volver al listado</Button>
        </div>
    );
  }

  return (
    <>
      <div className="px-4 sm:px-6 py-2">
        <Button variant="outline" onClick={() => router.push('/depreciacion/activos')} className="mb-4 text-amber-700 border-amber-300 hover:bg-amber-50">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Gestión de Activos
        </Button>
        <h1 className="text-xl font-semibold text-amber-800">Editar Activo Fijo</h1>
      </div>
      <main className="flex flex-1 flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Card className="w-full max-w-3xl shadow-lg">
          <CardHeader className="bg-amber-100 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-amber-700 flex items-center">
              <Edit3 className="mr-3 h-7 w-7" />
              Formulario de Edición de Activo
            </CardTitle>
            <CardDescription className="text-amber-600">
              Modifica los datos del activo. ID: {activo.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-amber-700">Nombre del Activo</Label>
                  <Input id="nombre" name="nombre" type="text" placeholder="Ej: Horno Industrial XYZ" value={activo.nombre} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaAdquisicion" className="text-amber-700">Fecha de Adquisición</Label>
                  <Input id="fechaAdquisicion" name="fechaAdquisicion" type="date" value={activo.fechaAdquisicion} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-amber-700">Descripción</Label>
                <Textarea id="descripcion" name="descripcion" placeholder="Detalles del activo, modelo, serie, etc." value={activo.descripcion} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" rows={3}/>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="valorAdquisicion" className="text-amber-700">Valor de Adquisición (S/)</Label>
                  <Input id="valorAdquisicion" name="valorAdquisicion" type="number" placeholder="Ej: 5500.50" value={activo.valorAdquisicion} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vidaUtilAnios" className="text-amber-700">Vida Útil (Años)</Label>
                  <Input id="vidaUtilAnios" name="vidaUtilAnios" type="number" placeholder="Ej: 5" value={activo.vidaUtilAnios} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" step="1" />
                </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="categoria" className="text-amber-700">Categoría</Label>
                  <Input id="categoria" name="categoria" type="text" placeholder="Ej: Maquinaria, Mobiliario" value={activo.categoria} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-amber-700">Estado</Label>
                  <Input id="estado" name="estado" type="text" placeholder="Ej: NUEVO, USADO" value={activo.estado} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
              </div>

              {error && !isFetching && (
                <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
                  <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              <Button type="submit" className="w-full text-lg py-3 bg-amber-600 hover:bg-amber-700 text-white" disabled={isLoading || isFetching}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Guardando Cambios...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-xs text-amber-600 p-4 bg-amber-50 rounded-b-lg">
              <p>Revisa cuidadosamente los datos antes de guardar las modificaciones.</p>
          </CardFooter>
        </Card>
      </main>
    </>
  );
}
