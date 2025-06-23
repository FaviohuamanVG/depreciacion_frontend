
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FileText, Calculator, CalendarIcon, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const API_BASE_URL_DEPRECIACIONES = 'https://humble-acorn-4j7wv774w4rg2qj4x-8080.app.github.dev/api/depreciaciones';
const API_BASE_URL_ACTIVOS = 'https://humble-acorn-4j7wv774w4rg2qj4x-8080.app.github.dev/api/activos';

interface Depreciacion {
  id: string;
  activoId: string;
  fecha: string;
  valorDepreciado: number;
  valorLibros: number;
  anioDepreciacion?: number;
  mesDepreciacion?: number;
  tasaDepreciacionAplicada?: number;
  observaciones?: string;
}

interface ActivoBasic {
  id: string;
  descripcion: string;
}

export default function ReportesPage() {
  const { toast } = useToast();
  
  // State for calculation form
  const [selectedActivoId, setSelectedActivoId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // State for data fetching
  const [activos, setActivos] = useState<ActivoBasic[]>([]);
  const [depreciaciones, setDepreciaciones] = useState<Depreciacion[]>([]);
  
  // State for loading and errors
  const [isLoading, setIsLoading] = useState({
    activos: true,
    depreciaciones: true,
    calculating: false,
    deleting: false,
  });
  const [error, setError] = useState<string | null>(null);

  const activosMap = useMemo(() => {
    return new Map(activos.map(activo => [activo.id, activo.descripcion]));
  }, [activos]);

  const fetchActivos = async () => {
    setIsLoading(prev => ({ ...prev, activos: true }));
    try {
      const response = await fetch(API_BASE_URL_ACTIVOS);
      if (!response.ok) throw new Error('No se pudieron cargar los activos');
      const data: ActivoBasic[] = await response.json();
      setActivos(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al cargar activos.';
      toast({ title: 'Error al Cargar Activos', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(prev => ({ ...prev, activos: false }));
    }
  };

  const fetchDepreciaciones = async () => {
    setIsLoading(prev => ({ ...prev, depreciaciones: true }));
    setError(null);
    try {
      const response = await fetch(API_BASE_URL_DEPRECIACIONES);
      if (!response.ok) throw new Error('No se pudo cargar el historial de depreciaciones');
      const data: Depreciacion[] = await response.json();
      setDepreciaciones(data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido.';
      setError(message);
      toast({ title: 'Error al Cargar Historial', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(prev => ({ ...prev, depreciaciones: false }));
    }
  };

  useEffect(() => {
    fetchActivos();
    fetchDepreciaciones();
  }, []);

  const handleCalcularDepreciacion = async () => {
    if (!selectedActivoId || !selectedDate) {
      toast({ title: 'Faltan datos', description: 'Por favor, selecciona un activo y una fecha.', variant: 'destructive' });
      return;
    }
    
    setIsLoading(prev => ({ ...prev, calculating: true }));
    const fechaISO = format(selectedDate, 'yyyy-MM-dd');
    
    try {
      const response = await fetch(`${API_BASE_URL_DEPRECIACIONES}/calcular/${selectedActivoId}?fecha=${fechaISO}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({ title: 'Éxito', description: 'Depreciación calculada y registrada correctamente.' });
        fetchDepreciaciones(); // Refresh the list
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error al calcular la depreciación.' }));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido.';
      toast({ title: 'Error en el Cálculo', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(prev => ({ ...prev, calculating: false }));
    }
  };

  const handleDeleteDepreciacion = async (depreciacionId: string) => {
    setIsLoading(prev => ({ ...prev, deleting: true }));
    try {
      const response = await fetch(`${API_BASE_URL_DEPRECIACIONES}/${depreciacionId}`, {
        method: 'DELETE',
      });
      if (response.ok || response.status === 204) {
        toast({ title: 'Depreciación Eliminada', description: 'El registro ha sido eliminado.' });
        setDepreciaciones(prev => prev.filter(d => d.id !== depreciacionId));
      } else {
         const errorData = await response.json().catch(() => ({ message: 'Error desconocido al eliminar.' }));
         throw new Error(errorData.message || `Error ${response.status}`);
      }
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al eliminar.';
        toast({ title: 'Error al Eliminar', description: message, variant: 'destructive' });
    } finally {
        setIsLoading(prev => ({ ...prev, deleting: false }));
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        // Add time zone offset to prevent date changes
        const offsetDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
        return format(offsetDate, 'dd/MM/yyyy');
    } catch {
        return dateString;
    }
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (typeof value !== 'number') return 'N/A';
    return `S/ ${value.toFixed(2)}`;
  };

  return (
    <>
      <div className="px-4 sm:px-6 py-2">
        <h1 className="text-xl font-semibold text-amber-800">Cálculo y Reportes de Depreciación</h1>
      </div>
      <main className="flex flex-1 flex-col items-start p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 space-y-6">
        
        <Card className="w-full max-w-full shadow-lg">
          <CardHeader className="bg-amber-100 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-amber-700 flex items-center">
              <Calculator className="mr-3 h-7 w-7" />
              Calcular y Registrar Depreciación
            </CardTitle>
            <CardDescription className="text-amber-600">
              Selecciona un activo y una fecha para calcular y guardar un nuevo registro de depreciación.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-amber-700">Activo</label>
                <Select
                  onValueChange={setSelectedActivoId}
                  value={selectedActivoId}
                  disabled={isLoading.activos || isLoading.calculating}
                >
                  <SelectTrigger className="w-full border-amber-300 focus:border-amber-500 ring-offset-amber-50">
                    <SelectValue placeholder={isLoading.activos ? 'Cargando activos...' : 'Seleccione un activo'} />
                  </SelectTrigger>
                  <SelectContent>
                    {activos.map(activo => (
                      <SelectItem key={activo.id} value={activo.id}>
                        {activo.descripcion}
                      </SelectItem>
                    ))}
                    {!isLoading.activos && activos.length === 0 && (
                      <SelectItem value="no-options" disabled>No hay activos para seleccionar</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-amber-700">Fecha de Cálculo</label>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal border-amber-300 hover:bg-amber-50"
                        disabled={isLoading.calculating}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                        />
                    </PopoverContent>
                </Popover>
              </div>
              <Button
                onClick={handleCalcularDepreciacion}
                disabled={isLoading.calculating || !selectedActivoId || !selectedDate || isLoading.activos}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isLoading.calculating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Calculator className="mr-2 h-4 w-4" />
                )}
                Calcular y Registrar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full max-w-full shadow-lg">
          <CardHeader className="bg-amber-100 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-amber-700 flex items-center">
              <FileText className="mr-3 h-7 w-7" />
              Historial de Depreciaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading.depreciaciones ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
                <p className="ml-4 text-amber-600">Cargando historial...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-md">
                 <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
                 <p className="text-red-700 font-semibold">Error al cargar el historial</p>
                 <p className="text-red-600 text-sm">{error}</p>
                 <Button variant="outline" onClick={fetchDepreciaciones} className="mt-4 text-amber-700 border-amber-300 hover:bg-amber-50">Reintentar</Button>
              </div>
            ) : depreciaciones.length === 0 ? (
               <div className="mt-6 border-2 border-dashed border-amber-300 rounded-lg p-10 text-center text-amber-500">
                  <p>No hay registros de depreciación. ¡Calcula el primero!</p>
               </div>
            ) : (
              <div className="overflow-x-auto mt-6">
                <Table className="min-w-full">
                  <TableHeader className="bg-amber-50">
                    <TableRow>
                      <TableHead className="text-amber-700 font-semibold">Activo</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Fecha</TableHead>
                      <TableHead className="text-amber-700 font-semibold text-right">Valor Depreciado</TableHead>
                      <TableHead className="text-amber-700 font-semibold text-right">Valor en Libros</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Observaciones</TableHead>
                      <TableHead className="text-amber-700 font-semibold text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {depreciaciones.map((dep) => (
                      <TableRow key={dep.id} className="hover:bg-amber-50/50">
                        <TableCell className="text-muted-foreground font-medium">{activosMap.get(dep.activoId) || dep.activoId}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(dep.fecha)}</TableCell>
                        <TableCell className="text-muted-foreground text-right">{formatCurrency(dep.valorDepreciado)}</TableCell>
                        <TableCell className="text-muted-foreground text-right">{formatCurrency(dep.valorLibros)}</TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">{dep.observaciones || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-red-500 border-red-300 hover:bg-red-100 hover:text-red-600"
                                disabled={isLoading.deleting}
                                title="Eliminar Registro"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Confirmar Eliminación?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este registro de depreciación?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isLoading.deleting}>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                    onClick={() => handleDeleteDepreciacion(dep.id)}
                                    disabled={isLoading.deleting}
                                    className="bg-red-600 hover:bg-red-700"
                                    >
                                    {isLoading.deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Eliminar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
