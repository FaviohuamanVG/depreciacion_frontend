
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

const API_BASE_URL_ACTIVOS = 'https://humble-acorn-4j7wv774w4rg2qj4x-8080.app.github.dev/api/activos';
const API_BASE_URL_CATEGORIAS = 'https://humble-acorn-4j7wv774w4rg2qj4x-8080.app.github.dev/api/categorias';

type EstadoActivo = 'ACTIVO' | 'INACTIVO' | 'EN_MANTENIMIENTO' | 'DADO_DE_BAJA';
type MetodoDepreciacion = 'LINEA_RECTA' | 'SUMA_DIGITOS' | 'REDUCCION_SALDOS' | 'UNIDADES_PRODUCIDAS';

interface CategoriaBasic {
  id: string;
  nombreCategoria: string;
}

interface ActivoEditableForm {
  id: string;
  descripcion: string;
  tipo: string;
  marca: string;
  modelo: string;
  zona: string;
  costoAdquisicion: string; 
  fechaCompra: string; // YYYY-MM-DD
  categoriaId: string;
  vidaUtilAnios: string;    
  estado: EstadoActivo;
  valorResidual: string; 
  metodoDepreciacion: MetodoDepreciacion;
  depreciacionAnual?: string; 
}

export default function EditarActivoPage() {
  const router = useRouter();
  const params = useParams();
  const activoId = params.id as string;

  const [activo, setActivo] = useState<ActivoEditableForm | null>(null);
  const [categorias, setCategorias] = useState<CategoriaBasic[]>([]);
  const [isCategoriasLoading, setIsCategoriasLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingActivo, setIsFetchingActivo] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategorias = async () => {
      setIsCategoriasLoading(true);
      try {
        const response = await fetch(API_BASE_URL_CATEGORIAS);
        if (!response.ok) {
          throw new Error('No se pudieron cargar las categorías');
        }
        const data: CategoriaBasic[] = await response.json();
        setCategorias(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido al cargar categorías.';
        toast({
          title: 'Error al cargar Categorías',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setIsCategoriasLoading(false);
      }
    };
    fetchCategorias();
  }, [toast]);

  useEffect(() => {
    if (!activoId) {
      setError('ID de activo no encontrado.');
      setIsFetchingActivo(false);
      toast({ title: 'Error', description: 'No se proporcionó un ID de activo.', variant: 'destructive' });
      router.push('/depreciacion/activos');
      return;
    }

    const fetchActivoDetails = async () => {
      setIsFetchingActivo(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL_ACTIVOS}/${activoId}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error('Activo no encontrado.');
          const errorData = await response.json().catch(() => ({ message: `Error ${response.status}: ${response.statusText}` }));
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        let formattedFechaCompra = '';
        if (data.fechaCompra) {
            const dateObj = new Date(data.fechaCompra);
            const year = dateObj.getFullYear();
            const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
            const day = ('0' + dateObj.getDate()).slice(-2);
            formattedFechaCompra = `${year}-${month}-${day}`;
        }

        setActivo({
            ...data,
            costoAdquisicion: data.costoAdquisicion?.toString() || '0',
            vidaUtilAnios: data.vidaUtilAnios?.toString() || '0',
            valorResidual: data.valorResidual?.toString() || '0',
            depreciacionAnual: data.depreciacionAnual?.toFixed(2) || undefined,
            fechaCompra: formattedFechaCompra,
            descripcion: data.descripcion || '',
            tipo: data.tipo || '',
            marca: data.marca || '',
            modelo: data.modelo || '',
            zona: data.zona || '',
            categoriaId: data.categoriaId || '',
            estado: data.estado || 'ACTIVO',
            metodoDepreciacion: data.metodoDepreciacion || 'LINEA_RECTA',
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
        setIsFetchingActivo(false);
      }
    };

    fetchActivoDetails();
  }, [activoId, router, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!activo) return;
    const { name, value } = e.target;
    setActivo(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSelectChange = (name: keyof ActivoEditableForm, value: string) => {
    if (!activo) return;
    setActivo(prev => prev ? { ...prev, [name]: value as any } : null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!activo) {
      setError('No hay datos de activo para actualizar.');
      return;
    }
    setError(null);
    setIsLoading(true);

    const costoAdquisicionNum = parseFloat(activo.costoAdquisicion);
    const vidaUtilAniosNum = parseInt(activo.vidaUtilAnios, 10);
    const valorResidualNum = parseFloat(activo.valorResidual);

    const missingFields = [];
    if (!activo.descripcion) missingFields.push('Descripción');
    if (!activo.fechaCompra) missingFields.push('Fecha de Compra');
    if (!activo.categoriaId) missingFields.push('Categoría');
    if (isNaN(costoAdquisicionNum)) missingFields.push('Costo de Adquisición (debe ser un número)');
    if (isNaN(vidaUtilAniosNum)) missingFields.push('Vida Útil (debe ser un número entero)');
    if (isNaN(valorResidualNum)) missingFields.push('Valor Residual (debe ser un número)');

    if (missingFields.length > 0) {
      const errorMessage = `Por favor, completa los campos obligatorios: ${missingFields.join(', ')}.`;
      setError(errorMessage);
      setIsLoading(false);
      toast({ title: 'Error de Validación', description: errorMessage, variant: 'destructive' });
      return;
    }
     if (costoAdquisicionNum <= 0) {
        setError('El Costo de Adquisición debe ser un número positivo.');
        setIsLoading(false);
        toast({ title: 'Error de Validación', description: 'Costo de Adquisición debe ser positivo.', variant: 'destructive' });
        return;
    }
    if (vidaUtilAniosNum <= 0) {
        setError('La Vida Útil debe ser un número entero positivo.');
        setIsLoading(false);
        toast({ title: 'Error de Validación', description: 'Vida Útil debe ser positiva.', variant: 'destructive' });
        return;
    }
    if (valorResidualNum < 0) {
        setError('El Valor Residual no puede ser negativo.');
        setIsLoading(false);
        toast({ title: 'Error de Validación', description: 'Valor Residual no puede ser negativo.', variant: 'destructive' });
        return;
    }

    const { id, depreciacionAnual, ...updatePayloadRest } = activo; 
    const activoPayload = {
        ...updatePayloadRest,
        costoAdquisicion: costoAdquisicionNum,
        vidaUtilAnios: vidaUtilAniosNum,
        valorResidual: valorResidualNum,
    };

    try {
      const response = await fetch(`${API_BASE_URL_ACTIVOS}/${activo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activoPayload),
      });

      if (response.ok || response.status === 200) { 
        toast({
          title: 'Activo Actualizado',
          description: `El activo "${activo.descripcion}" ha sido actualizado exitosamente.`,
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

  if (isFetchingActivo || (isCategoriasLoading && !categorias.length)) { 
    return (
      <div className="flex flex-1 justify-center items-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
        <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
        <p className="ml-4 text-amber-600">Cargando datos...</p>
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
              <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-amber-700">Descripción del Activo</Label>
                <Textarea id="descripcion" name="descripcion" placeholder="Ej: Horno Industrial para pollos" value={activo.descripcion} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" rows={3} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tipo" className="text-amber-700">Tipo</Label>
                  <Input id="tipo" name="tipo" type="text" placeholder="Ej: Maquinaria, Vehículo" value={activo.tipo} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoriaId" className="text-amber-700">Categoría</Label>
                    <Select 
                        value={activo.categoriaId} 
                        onValueChange={(value) => handleSelectChange('categoriaId', value)} 
                        disabled={isLoading || isCategoriasLoading}
                    >
                        <SelectTrigger className="w-full border-amber-300 focus:border-amber-500 ring-offset-amber-50">
                        <SelectValue placeholder={isCategoriasLoading ? "Cargando categorías..." : "Seleccione una categoría"} />
                        </SelectTrigger>
                        <SelectContent>
                        {isCategoriasLoading ? (
                            <SelectItem value="loading" disabled>Cargando...</SelectItem>
                        ) : categorias.length === 0 ? (
                            <SelectItem value="no-options" disabled>No hay categorías disponibles</SelectItem>
                        ) : (
                            categorias.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.nombreCategoria}</SelectItem>
                            ))
                        )}
                        </SelectContent>
                    </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="marca" className="text-amber-700">Marca</Label>
                  <Input id="marca" name="marca" type="text" placeholder="Ej: Rational" value={activo.marca} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo" className="text-amber-700">Modelo</Label>
                  <Input id="modelo" name="modelo" type="text" placeholder="Ej: SelfCookingCenter" value={activo.modelo} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zona" className="text-amber-700">Zona/Ubicación</Label>
                  <Input id="zona" name="zona" type="text" placeholder="Ej: Cocina Principal" value={activo.zona} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fechaCompra" className="text-amber-700">Fecha de Compra</Label>
                  <Input id="fechaCompra" name="fechaCompra" type="date" value={activo.fechaCompra} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costoAdquisicion" className="text-amber-700">Costo de Adquisición (S/)</Label>
                  <Input id="costoAdquisicion" name="costoAdquisicion" type="number" placeholder="Ej: 5500.50" value={activo.costoAdquisicion} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" step="0.01" />
                </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vidaUtilAnios" className="text-amber-700">Vida Útil (Años)</Label>
                  <Input id="vidaUtilAnios" name="vidaUtilAnios" type="number" placeholder="Ej: 5" value={activo.vidaUtilAnios} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" step="1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valorResidual" className="text-amber-700">Valor Residual (S/)</Label>
                  <Input id="valorResidual" name="valorResidual" type="number" placeholder="Ej: 500.00" value={activo.valorResidual} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" step="0.01" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-amber-700">Estado</Label>
                   <Select value={activo.estado} onValueChange={(value) => handleSelectChange('estado', value)} disabled={isLoading}>
                    <SelectTrigger className="w-full border-amber-300 focus:border-amber-500 ring-offset-amber-50">
                      <SelectValue placeholder="Seleccione un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                      <SelectItem value="INACTIVO">INACTIVO</SelectItem>
                      <SelectItem value="EN_MANTENIMIENTO">EN MANTENIMIENTO</SelectItem>
                      <SelectItem value="DADO_DE_BAJA">DADO DE BAJA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="metodoDepreciacion" className="text-amber-700">Método de Depreciación</Label>
                   <Select value={activo.metodoDepreciacion} onValueChange={(value) => handleSelectChange('metodoDepreciacion', value)} disabled={isLoading}>
                    <SelectTrigger className="w-full border-amber-300 focus:border-amber-500 ring-offset-amber-50">
                      <SelectValue placeholder="Seleccione un método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LINEA_RECTA">LINEA RECTA</SelectItem>
                      <SelectItem value="SUMA_DIGITOS">SUMA DE DÍGITOS</SelectItem>
                      <SelectItem value="REDUCCION_SALDOS">REDUCCIÓN DE SALDOS</SelectItem>
                      <SelectItem value="UNIDADES_PRODUCIDAS">UNIDADES PRODUCIDAS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
                
              {activo.depreciacionAnual !== undefined && (
                <div className="space-y-2">
                    <Label className="text-amber-700">Depreciación Anual Calculada (S/)</Label>
                    <Input type="text" value={activo.depreciacionAnual} disabled className="border-amber-300 bg-amber-50 text-amber-800 font-medium" />
                </div>
              )}

              {error && !isFetchingActivo && (
                <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
                  <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              <Button type="submit" className="w-full text-lg py-3 bg-amber-600 hover:bg-amber-700 text-white" disabled={isLoading || isFetchingActivo || isCategoriasLoading}>
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
