
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Archive, PlusCircle, Edit2, Loader2, AlertCircle, ArchiveRestore, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL_ACTIVOS = 'https://humble-acorn-4j7wv774w4rg2qj4x-8080.app.github.dev/api/activos';

interface Activo {
  id: string;
  descripcion: string;
  tipo?: string;
  marca?: string;
  modelo?: string;
  zona?: string;
  costoAdquisicion: number;
  fechaCompra: string; 
  categoriaId?: string;
  vidaUtilAnios: number;
  estado: 'ACTIVO' | 'INACTIVO' | 'EN_MANTENIMIENTO' | 'DADO_DE_BAJA';
  valorResidual?: number;
  metodoDepreciacion?: 'LINEA_RECTA' | 'SUMA_DIGITOS' | 'REDUCCION_SALDOS' | 'UNIDADES_PRODUCIDAS';
  depreciacionAnual?: number;
}

export default function ActivosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activos, setActivos] = useState<Activo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStateChanging, setIsStateChanging] = useState(false);
  const [view, setView] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchActivos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL_ACTIVOS);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error ${response.status}: ${response.statusText}` }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      const data: Activo[] = await response.json();
      setActivos(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo obtener la lista de activos.';
      setError(message);
      toast({
        title: 'Error al Cargar Activos',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivos();
  }, []);

  const displayedActivos = useMemo(() => {
    switch (view) {
      case 'active':
        return activos.filter(a => a.estado === 'ACTIVO' || a.estado === 'EN_MANTENIMIENTO');
      case 'inactive':
        return activos.filter(a => a.estado === 'INACTIVO' || a.estado === 'DADO_DE_BAJA');
      case 'all':
      default:
        return activos;
    }
  }, [activos, view]);

  const handleNavigateToCreateActivo = () => {
    router.push('/depreciacion/activos/crear');
  };

  const handleNavigateToEditActivo = (activoId: string) => {
    router.push(`/depreciacion/activos/editar/${activoId}`);
  };

  const handleChangeStatus = async (activoId: string, newStatus: 'ACTIVO' | 'INACTIVO') => {
    setIsStateChanging(true);
    const action = newStatus === 'ACTIVO' ? 'activar' : 'desactivar';
    try {
      const url = new URL(`${API_BASE_URL_ACTIVOS}/${activoId}/${action}`);
      const response = await fetch(url.href, {
        method: 'PUT',
      });

      if (response.ok) {
        const updatedActivo = await response.json();
        toast({
          title: `Activo ${action === 'activar' ? 'Activado' : 'Desactivado'}`,
          description: 'El estado del activo ha sido actualizado.',
        });
        setActivos(prevActivos =>
          prevActivos.map(a => (a.id === activoId ? updatedActivo : a))
        );
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido al cambiar estado.' }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cambiar estado.';
      toast({
        title: 'Error al Actualizar Estado',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsStateChanging(false);
    }
  };


  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const dateParts = dateString.split('T')[0].split('-'); 
      if (dateParts.length === 3) {
         const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
         return date.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
         });
      }
      const date = new Date(dateString);
      return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return dateString; 
    }
  };

  return (
    <>
      <div className="px-4 sm:px-6 py-2">
        <h1 className="text-xl font-semibold text-amber-800">Gestión de Activos Fijos</h1>
      </div>
      <main className="flex flex-1 flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Card className="w-full max-w-full shadow-lg">
          <CardHeader className="bg-amber-100 rounded-t-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
            <div>
              <CardTitle className="text-2xl font-bold text-amber-700 flex items-center">
                <Archive className="mr-3 h-7 w-7" />
                Listado de Activos
              </CardTitle>
              <CardDescription className="text-amber-600">
                Administre los activos fijos de la pollería.
              </CardDescription>
            </div>
            <div className="flex w-full sm:w-auto items-center gap-2">
                <Select value={view} onValueChange={(value) => setView(value as any)}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-white border-amber-300">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Mostrar Todos</SelectItem>
                        <SelectItem value="active">Mostrar Activos</SelectItem>
                        <SelectItem value="inactive">Mostrar Inactivos</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={handleNavigateToCreateActivo} className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Crear Nuevo Activo
                </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading && (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
                <p className="ml-4 text-amber-600">Cargando activos...</p>
              </div>
            )}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
                <p className="text-red-700 font-semibold">Error al cargar activos</p>
                <p className="text-red-600 text-sm">{error}</p>
                <Button variant="outline" onClick={fetchActivos} className="mt-4 text-amber-700 border-amber-300 hover:bg-amber-50">
                  Reintentar
                </Button>
              </div>
            )}
            {!isLoading && !error && displayedActivos.length === 0 && (
              <div className="mt-6 border-2 border-dashed border-amber-300 rounded-lg p-10 text-center text-amber-500">
                <p>
                  {view === 'all' && "No se encontraron activos. ¡Empieza creando uno!"}
                  {view === 'active' && "No se encontraron activos en estado 'ACTIVO' o 'EN MANTENIMIENTO'."}
                  {view === 'inactive' && "No se encontraron activos en estado 'INACTIVO' o 'DADO DE BAJA'."}
                </p>
              </div>
            )}
            {!isLoading && !error && displayedActivos.length > 0 && (
              <div className="overflow-x-auto mt-6">
                <Table className="min-w-full">
                  <TableHeader className="bg-amber-50">
                    <TableRow>
                      <TableHead className="text-amber-700 font-semibold">Descripción</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Tipo</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Marca</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Fecha Compra</TableHead>
                      <TableHead className="text-amber-700 font-semibold text-right">Costo (S/)</TableHead>
                      <TableHead className="text-amber-700 font-semibold text-center">Vida Útil (Años)</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Estado</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Método Deprec.</TableHead>
                      <TableHead className="text-amber-700 font-semibold text-right">Deprec. Anual (S/)</TableHead>
                      <TableHead className="text-amber-700 font-semibold text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedActivos.map((activo) => {
                      const isActivo = activo.estado === 'ACTIVO' || activo.estado === 'EN_MANTENIMIENTO';
                      const canToggle = activo.estado === 'ACTIVO' || activo.estado === 'INACTIVO';
                      
                      return (
                      <TableRow key={activo.id} className="hover:bg-amber-50/50">
                        <TableCell className="text-muted-foreground font-medium max-w-xs truncate">{activo.descripcion || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{activo.tipo || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{activo.marca || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(activo.fechaCompra)}</TableCell>
                        <TableCell className="text-muted-foreground text-right">{typeof activo.costoAdquisicion === 'number' ? activo.costoAdquisicion.toFixed(2) : 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground text-center">{activo.vidaUtilAnios > 0 ? activo.vidaUtilAnios : 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{activo.estado || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{activo.metodoDepreciacion?.replace('_', ' ') || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground text-right">{typeof activo.depreciacionAnual === 'number' ? activo.depreciacionAnual.toFixed(2) : 'N/A'}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-amber-600 border-amber-300 hover:bg-amber-100 hover:text-amber-700" 
                            onClick={() => handleNavigateToEditActivo(activo.id)}
                            disabled={isStateChanging}
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          {canToggle && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className={isActivo ? "text-red-500 border-red-300 hover:bg-red-100 hover:text-red-600" : "text-green-500 border-green-300 hover:bg-green-100 hover:text-green-600"}
                                  disabled={isStateChanging}
                                  title={isActivo ? "Desactivar" : "Activar"}
                                >
                                  {isActivo ? <Archive className="h-4 w-4" /> : <ArchiveRestore className="h-4 w-4" />}
                                  <span className="sr-only">{isActivo ? "Desactivar" : "Activar"}</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Confirmar cambio de estado?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {isActivo 
                                      ? `¿Estás seguro de que quieres desactivar el activo: "${activo.descripcion || 'este activo'}"?` 
                                      : `¿Estás seguro de que quieres reactivar el activo: "${activo.descripcion || 'este activo'}"?`}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel disabled={isStateChanging}>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleChangeStatus(activo.id, isActivo ? 'INACTIVO' : 'ACTIVO')}
                                    disabled={isStateChanging}
                                    className={isActivo ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                                  >
                                    {isStateChanging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isActivo ? 'Desactivar' : 'Activar'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    )})}
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
    
