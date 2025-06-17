
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Archive, PlusCircle, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL_ACTIVOS = 'https://humble-acorn-4j7wv774w4rg2qj4x-8080.app.github.dev/api/activos';

interface Activo {
  id: string;
  nombre: string;
  descripcion?: string;
  fechaAdquisicion: string; // YYYY-MM-DD
  valorAdquisicion: number;
  vidaUtilAnios: number;
  categoria?: string;
  estado?: string;
}

export default function ActivosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activos, setActivos] = useState<Activo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleNavigateToCreateActivo = () => {
    router.push('/depreciacion/activos/crear');
  };

  const handleNavigateToEditActivo = (activoId: string) => {
    router.push(`/depreciacion/activos/editar/${activoId}`);
  };

  const handleDeleteActivo = async (activoId: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL_ACTIVOS}/${activoId}`, {
        method: 'DELETE',
      });
      if (response.ok || response.status === 204) {
        toast({
          title: 'Activo Eliminado',
          description: 'El activo ha sido eliminado exitosamente.',
        });
        setActivos(prevActivos => prevActivos.filter(a => a.id !== activoId));
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido al eliminar activo.' }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar el activo.';
      toast({
        title: 'Error al Eliminar',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString + 'T00:00:00'); // Asegurar que se interprete como fecha local
      return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return dateString; // Devuelve el string original si hay error
    }
  };

  return (
    <>
      <div className="px-4 sm:px-6 py-2">
        <h1 className="text-xl font-semibold text-amber-800">Gestión de Activos Fijos</h1>
      </div>
      <main className="flex flex-1 flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Card className="w-full max-w-6xl shadow-lg">
          <CardHeader className="bg-amber-100 rounded-t-lg flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-amber-700 flex items-center">
                <Archive className="mr-3 h-7 w-7" />
                Listado de Activos
              </CardTitle>
              <CardDescription className="text-amber-600">
                Administre los activos fijos de la pollería.
              </CardDescription>
            </div>
            <Button onClick={handleNavigateToCreateActivo} className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
              <PlusCircle className="mr-2 h-5 w-5" />
              Crear Nuevo Activo
            </Button>
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
            {!isLoading && !error && activos.length === 0 && (
              <div className="mt-6 border-2 border-dashed border-amber-300 rounded-lg p-10 text-center text-amber-500">
                <p>No se encontraron activos. ¡Empieza creando uno!</p>
              </div>
            )}
            {!isLoading && !error && activos.length > 0 && (
              <div className="overflow-x-auto mt-6">
                <Table className="min-w-full">
                  <TableHeader className="bg-amber-50">
                    <TableRow>
                      <TableHead className="text-amber-700 font-semibold">Nombre</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Fecha Adquisición</TableHead>
                      <TableHead className="text-amber-700 font-semibold text-right">Valor (S/)</TableHead>
                      <TableHead className="text-amber-700 font-semibold text-center">Vida Útil (Años)</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Categoría</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Estado</TableHead>
                      <TableHead className="text-amber-700 font-semibold text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activos.map((activo) => (
                      <TableRow key={activo.id} className="hover:bg-amber-50/50">
                        <TableCell className="text-muted-foreground font-medium">{activo.nombre}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(activo.fechaAdquisicion)}</TableCell>
                        <TableCell className="text-muted-foreground text-right">{activo.valorAdquisicion.toFixed(2)}</TableCell>
                        <TableCell className="text-muted-foreground text-center">{activo.vidaUtilAnios}</TableCell>
                        <TableCell className="text-muted-foreground">{activo.categoria || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{activo.estado || 'N/A'}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-amber-600 border-amber-300 hover:bg-amber-100 hover:text-amber-700" 
                            onClick={() => handleNavigateToEditActivo(activo.id)}
                            disabled={isDeleting}
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="text-red-500 border-red-300 hover:bg-red-100 hover:text-red-600"
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Confirmar Eliminación?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar el activo "{activo.nombre}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteActivo(activo.id)} 
                                  disabled={isDeleting}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
