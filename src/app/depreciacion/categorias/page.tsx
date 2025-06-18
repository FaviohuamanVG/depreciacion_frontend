
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tags, PlusCircle, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL_CATEGORIAS = 'https://humble-acorn-4j7wv774w4rg2qj4x-8080.app.github.dev/api/categorias';

interface CategoriaActivo {
  id: string;
  nombreCategoria: string;
  descripcion?: string;
  estado: 'ACTIVO' | 'INACTIVO';
  fechaCreacion?: string; 
  fechaModificacion?: string | null;
  vidaUtilPredeterminada?: number;
  tasaDepreciacionAnual?: number;
  codigoContable?: string;
}

export default function CategoriasPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [categorias, setCategorias] = useState<CategoriaActivo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategorias = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL_CATEGORIAS);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error ${response.status}: ${response.statusText}` }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      const data: CategoriaActivo[] = await response.json();
      setCategorias(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo obtener la lista de categorías.';
      setError(message);
      toast({
        title: 'Error al Cargar Categorías',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleNavigateToCreateCategoria = () => {
    router.push('/depreciacion/categorias/crear');
  };

  const handleNavigateToEditCategoria = (categoriaId: string) => {
    router.push(`/depreciacion/categorias/editar/${categoriaId}`);
  };

  const handleDeleteCategoria = async (categoriaId: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL_CATEGORIAS}/${categoriaId}`, {
        method: 'DELETE',
      });
      if (response.ok || response.status === 204) { 
        toast({
          title: 'Categoría Eliminada',
          description: 'La categoría ha sido eliminada exitosamente.',
        });
        setCategorias(prevCategorias => prevCategorias.filter(c => c.id !== categoriaId));
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido al eliminar categoría.' }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar la categoría.';
      toast({
        title: 'Error al Eliminar',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-PE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <>
      <div className="px-4 sm:px-6 py-2">
        <h1 className="text-xl font-semibold text-amber-800">Gestión de Categorías de Activos</h1>
      </div>
      <main className="flex flex-1 flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Card className="w-full max-w-full shadow-lg">
          <CardHeader className="bg-amber-100 rounded-t-lg flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-amber-700 flex items-center">
                <Tags className="mr-3 h-7 w-7" />
                Listado de Categorías
              </CardTitle>
              <CardDescription className="text-amber-600">
                Administre las categorías de los activos.
              </CardDescription>
            </div>
            <Button onClick={handleNavigateToCreateCategoria} className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
              <PlusCircle className="mr-2 h-5 w-5" />
              Crear Nueva Categoría
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading && (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
                <p className="ml-4 text-amber-600">Cargando categorías...</p>
              </div>
            )}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
                <p className="text-red-700 font-semibold">Error al cargar categorías</p>
                <p className="text-red-600 text-sm">{error}</p>
                <Button variant="outline" onClick={fetchCategorias} className="mt-4 text-amber-700 border-amber-300 hover:bg-amber-50">
                  Reintentar
                </Button>
              </div>
            )}
            {!isLoading && !error && categorias.length === 0 && (
              <div className="mt-6 border-2 border-dashed border-amber-300 rounded-lg p-10 text-center text-amber-500">
                <p>No se encontraron categorías. ¡Empieza creando una!</p>
              </div>
            )}
            {!isLoading && !error && categorias.length > 0 && (
              <div className="overflow-x-auto mt-6">
                <Table className="min-w-full">
                  <TableHeader className="bg-amber-50">
                    <TableRow>
                      <TableHead className="text-amber-700 font-semibold">Nombre Categoría</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Descripción</TableHead>
                      <TableHead className="text-amber-700 font-semibold text-center">Vida Útil Pred.</TableHead>
                      <TableHead className="text-amber-700 font-semibold text-center">Tasa Deprec. (%)</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Cód. Contable</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Estado</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Fecha Creación</TableHead>
                      <TableHead className="text-amber-700 font-semibold text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categorias.map((cat) => (
                      <TableRow key={cat.id} className="hover:bg-amber-50/50">
                        <TableCell className="text-muted-foreground font-medium max-w-xs truncate">{cat.nombreCategoria || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground max-w-sm truncate">{cat.descripcion || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground text-center">{cat.vidaUtilPredeterminada ?? 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground text-center">{cat.tasaDepreciacionAnual !== undefined ? (cat.tasaDepreciacionAnual * 100).toFixed(0) + '%' : 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{cat.codigoContable || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{cat.estado || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(cat.fechaCreacion)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-amber-600 border-amber-300 hover:bg-amber-100 hover:text-amber-700" 
                            onClick={() => handleNavigateToEditCategoria(cat.id)}
                            disabled={isDeleting}
                            title="Editar"
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
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Confirmar Eliminación?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar la categoría: "{cat.nombreCategoria || 'esta categoría'}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteCategoria(cat.id)} 
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
