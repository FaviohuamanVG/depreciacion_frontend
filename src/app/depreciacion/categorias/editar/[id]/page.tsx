
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Save, AlertCircle, ArrowLeft, Loader2, Edit3 } from 'lucide-react';

const API_BASE_URL_CATEGORIAS = 'https://humble-acorn-4j7wv774w4rg2qj4x-8080.app.github.dev/api/categorias';

type EstadoCategoria = 'ACTIVO' | 'INACTIVO';

interface CategoriaEditableForm {
  id: string;
  nombreCategoria: string;
  descripcion: string;
  estado: EstadoCategoria;
  vidaUtilPredeterminada: string;
  tasaDepreciacionAnual: string;
  codigoContable: string;
}

export default function EditarCategoriaPage() {
  const router = useRouter();
  const params = useParams();
  const categoriaId = params.id as string;

  const [categoria, setCategoria] = useState<CategoriaEditableForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!categoriaId) {
      setError('ID de categoría no encontrado.');
      setIsFetching(false);
      toast({ title: 'Error', description: 'No se proporcionó un ID de categoría.', variant: 'destructive' });
      router.push('/depreciacion/categorias');
      return;
    }

    const fetchCategoriaDetails = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL_CATEGORIAS}/${categoriaId}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error('Categoría no encontrada.');
          const errorData = await response.json().catch(() => ({ message: `Error ${response.status}: ${response.statusText}` }));
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setCategoria({
          ...data,
          vidaUtilPredeterminada: data.vidaUtilPredeterminada?.toString() || '0',
          tasaDepreciacionAnual: data.tasaDepreciacionAnual?.toString() || '0',
          descripcion: data.descripcion || '',
          codigoContable: data.codigoContable || '',
          estado: data.estado || 'ACTIVO',
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo obtener los detalles de la categoría.';
        setError(message);
        toast({
          title: 'Error al Cargar Categoría',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchCategoriaDetails();
  }, [categoriaId, router, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!categoria) return;
    const { name, value } = e.target;
    setCategoria(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSelectChange = (value: EstadoCategoria) => {
    if (!categoria) return;
    setCategoria(prev => prev ? { ...prev, estado: value } : null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoria) {
      setError('No hay datos de categoría para actualizar.');
      return;
    }
    setError(null);
    setIsLoading(true);

    const vidaUtilPredeterminadaNum = parseInt(categoria.vidaUtilPredeterminada, 10);
    const tasaDepreciacionAnualNum = parseFloat(categoria.tasaDepreciacionAnual);

    const missingFields = [];
    if (!categoria.nombreCategoria) missingFields.push('Nombre de Categoría');
    if (isNaN(vidaUtilPredeterminadaNum)) missingFields.push('Vida Útil Predeterminada (debe ser un número entero)');
    if (isNaN(tasaDepreciacionAnualNum)) missingFields.push('Tasa de Depreciación Anual (debe ser un número)');

    if (missingFields.length > 0) {
      const errorMessage = `Por favor, completa los campos obligatorios: ${missingFields.join(', ')}.`;
      setError(errorMessage);
      setIsLoading(false);
      toast({ title: 'Error de Validación', description: errorMessage, variant: 'destructive' });
      return;
    }
    if (vidaUtilPredeterminadaNum <= 0) {
        setError('La Vida Útil Predeterminada debe ser un número entero positivo.');
        setIsLoading(false);
        toast({ title: 'Error de Validación', description: 'Vida Útil Predeterminada debe ser positiva.', variant: 'destructive' });
        return;
    }
    if (tasaDepreciacionAnualNum <= 0 || tasaDepreciacionAnualNum > 1) {
        setError('La Tasa de Depreciación Anual debe ser un número entre 0 (exclusivo) y 1 (inclusivo). Ej: 0.25 para 25%.');
        setIsLoading(false);
        toast({ title: 'Error de Validación', description: 'Tasa de Depreciación Anual debe estar entre 0 y 1.', variant: 'destructive' });
        return;
    }

    const categoriaPayload = {
      ...categoria,
      vidaUtilPredeterminada: vidaUtilPredeterminadaNum,
      tasaDepreciacionAnual: tasaDepreciacionAnualNum,
    };

    try {
      const response = await fetch(`${API_BASE_URL_CATEGORIAS}/${categoria.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoriaPayload),
      });

      if (response.ok || response.status === 200) { 
        toast({
          title: 'Categoría Actualizada',
          description: `La categoría "${categoria.nombreCategoria}" ha sido actualizada exitosamente.`,
        });
        router.push('/depreciacion/categorias');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido al actualizar categoría.' }));
        const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
        setError(errorMessage);
        toast({
          title: 'Error al Actualizar Categoría',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo conectar al servicio.';
      setError(`Error de red: ${message}`);
      toast({
        title: 'Error de Conexión',
        description: `No se pudo conectar al servicio para actualizar la categoría. ${message}`,
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
        <p className="ml-4 text-amber-600">Cargando datos de la categoría...</p>
      </div>
    );
  }

  if (error && !categoria) {
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
            <Button variant="outline" onClick={() => router.push('/depreciacion/categorias')} className="mt-4 text-amber-700 border-amber-300 hover:bg-amber-50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Listado de Categorías
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }
  
  if (!categoria) {
    return (
        <div className="flex flex-1 justify-center items-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
            <p className="text-amber-700">No se encontraron datos de la categoría para editar.</p>
            <Button variant="link" onClick={() => router.push('/depreciacion/categorias')} className="mt-2">Volver al listado</Button>
        </div>
    );
  }

  return (
    <>
      <div className="px-4 sm:px-6 py-2">
        <Button variant="outline" onClick={() => router.push('/depreciacion/categorias')} className="mb-4 text-amber-700 border-amber-300 hover:bg-amber-50">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Gestión de Categorías
        </Button>
        <h1 className="text-xl font-semibold text-amber-800">Editar Categoría de Activo</h1>
      </div>
      <main className="flex flex-1 flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="bg-amber-100 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-amber-700 flex items-center">
              <Edit3 className="mr-3 h-7 w-7" />
              Formulario de Edición de Categoría
            </CardTitle>
            <CardDescription className="text-amber-600">
              Modifica los datos de la categoría. ID: {categoria.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="space-y-2">
                <Label htmlFor="nombreCategoria" className="text-amber-700">Nombre de Categoría</Label>
                <Input id="nombreCategoria" name="nombreCategoria" placeholder="Ej: Equipos de Cómputo" value={categoria.nombreCategoria} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-amber-700">Descripción</Label>
                <Textarea id="descripcion" name="descripcion" placeholder="Ej: Computadoras, laptops y equipos relacionados" value={categoria.descripcion} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" rows={3} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vidaUtilPredeterminada" className="text-amber-700">Vida Útil Predeterminada (Años)</Label>
                  <Input id="vidaUtilPredeterminada" name="vidaUtilPredeterminada" type="number" placeholder="Ej: 4" value={categoria.vidaUtilPredeterminada} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" step="1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tasaDepreciacionAnual" className="text-amber-700">Tasa Depreciación Anual (Ej: 0.25)</Label>
                  <Input id="tasaDepreciacionAnual" name="tasaDepreciacionAnual" type="number" placeholder="Ej: 0.25" value={categoria.tasaDepreciacionAnual} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" step="0.01" min="0.01" max="1"/>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="codigoContable" className="text-amber-700">Código Contable</Label>
                  <Input id="codigoContable" name="codigoContable" type="text" placeholder="Ej: 33411" value={categoria.codigoContable} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-amber-700">Estado</Label>
                  <Select value={categoria.estado} onValueChange={handleSelectChange} disabled={isLoading}>
                    <SelectTrigger className="w-full border-amber-300 focus:border-amber-500 ring-offset-amber-50">
                      <SelectValue placeholder="Seleccione un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                      <SelectItem value="INACTIVO">INACTIVO</SelectItem>
                    </SelectContent>
                  </Select>
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
