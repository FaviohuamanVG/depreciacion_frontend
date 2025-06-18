
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

const API_BASE_URL_ACTIVOS = 'https://humble-acorn-4j7wv774w4rg2qj4x-8080.app.github.dev/api/activos';

type EstadoActivo = 'ACTIVO' | 'INACTIVO' | 'EN_MANTENIMIENTO' | 'DADO_DE_BAJA';
type MetodoDepreciacion = 'LINEA_RECTA' | 'SUMA_DIGITOS' | 'REDUCCION_SALDOS' | 'UNIDADES_PRODUCIDAS';

interface CategoriaBasic {
  id: string;
  nombreCategoria: string;
}

interface NewActivoForm {
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
}

export default function CrearActivoPage() {
  const [newActivo, setNewActivo] = useState<NewActivoForm>({
    descripcion: '',
    tipo: '',
    marca: '',
    modelo: '',
    zona: '',
    costoAdquisicion: '',
    fechaCompra: '',
    categoriaId: '',
    vidaUtilAnios: '',
    estado: 'ACTIVO',
    valorResidual: '0',
    metodoDepreciacion: 'LINEA_RECTA',
  });
  const [categorias, setCategorias] = useState<CategoriaBasic[]>([]);
  const [isCategoriasLoading, setIsCategoriasLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategorias = async () => {
      setIsCategoriasLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL_ACTIVOS}/categorias`);
        if (!response.ok) {
          throw new Error('No se pudieron cargar las categorías');
        }
        const data: CategoriaBasic[] = await response.json();
        setCategorias(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido.';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewActivo(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof NewActivoForm, value: string) => {
    setNewActivo(prev => ({ ...prev, [name]: value as any}));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const costoAdquisicionNum = parseFloat(newActivo.costoAdquisicion);
    const vidaUtilAniosNum = parseInt(newActivo.vidaUtilAnios, 10);
    const valorResidualNum = parseFloat(newActivo.valorResidual);

    const missingFields = [];
    if (!newActivo.descripcion) missingFields.push('Descripción');
    if (!newActivo.fechaCompra) missingFields.push('Fecha de Compra');
    if (!newActivo.categoriaId) missingFields.push('Categoría');
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

    const activoPayload = {
        ...newActivo,
        costoAdquisicion: costoAdquisicionNum,
        vidaUtilAnios: vidaUtilAniosNum,
        valorResidual: valorResidualNum,
    };

    try {
      const response = await fetch(API_BASE_URL_ACTIVOS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activoPayload),
      });

      if (response.ok || response.status === 201 || response.status === 200) { 
        toast({
          title: 'Activo Creado',
          description: `El activo "${newActivo.descripcion}" ha sido creado exitosamente.`,
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
              <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-amber-700">Descripción del Activo</Label>
                <Textarea id="descripcion" name="descripcion" placeholder="Ej: Horno Industrial para pollos, Modelo TurboMaster 5000, Serie HM-12345" value={newActivo.descripcion} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" rows={3} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tipo" className="text-amber-700">Tipo</Label>
                  <Input id="tipo" name="tipo" type="text" placeholder="Ej: Maquinaria, Vehículo, Mobiliario" value={newActivo.tipo} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoriaId" className="text-amber-700">Categoría</Label>
                  <Select 
                    value={newActivo.categoriaId} 
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
                  <Input id="marca" name="marca" type="text" placeholder="Ej: Rational, Toyota" value={newActivo.marca} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo" className="text-amber-700">Modelo</Label>
                  <Input id="modelo" name="modelo" type="text" placeholder="Ej: SelfCookingCenter, Hilux" value={newActivo.modelo} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zona" className="text-amber-700">Zona/Ubicación</Label>
                  <Input id="zona" name="zona" type="text" placeholder="Ej: Cocina Principal, Almacén A" value={newActivo.zona} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fechaCompra" className="text-amber-700">Fecha de Compra</Label>
                  <Input id="fechaCompra" name="fechaCompra" type="date" value={newActivo.fechaCompra} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costoAdquisicion" className="text-amber-700">Costo de Adquisición (S/)</Label>
                  <Input id="costoAdquisicion" name="costoAdquisicion" type="number" placeholder="Ej: 5500.50" value={newActivo.costoAdquisicion} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" step="0.01" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <Label htmlFor="vidaUtilAnios" className="text-amber-700">Vida Útil (Años)</Label>
                  <Input id="vidaUtilAnios" name="vidaUtilAnios" type="number" placeholder="Ej: 5" value={newActivo.vidaUtilAnios} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" step="1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valorResidual" className="text-amber-700">Valor Residual (S/)</Label>
                  <Input id="valorResidual" name="valorResidual" type="number" placeholder="Ej: 500.00" value={newActivo.valorResidual} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" step="0.01" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-amber-700">Estado</Label>
                  <Select value={newActivo.estado} onValueChange={(value) => handleSelectChange('estado', value)} disabled={isLoading}>
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
                   <Select value={newActivo.metodoDepreciacion} onValueChange={(value) => handleSelectChange('metodoDepreciacion', value)} disabled={isLoading}>
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

              {error && (
                <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
                  <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              <Button type="submit" className="w-full text-lg py-3 bg-amber-600 hover:bg-amber-700 text-white" disabled={isLoading || isCategoriasLoading}>
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
