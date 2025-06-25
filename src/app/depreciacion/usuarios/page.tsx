
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Users, UserPlus, AlertCircle, Loader2, Edit2, UserX, UserCheck, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL_USUARIOS = 'https://humble-acorn-4j7wv774w4rg2qj4x-8080.app.github.dev/api/usuarios';

interface Usuario {
  id: string;
  nombre: string;
  apellidos: string;
  dni: string;
  correo: string;
  rol: string;
  ultimoAcceso: string;
  estado: 'ACTIVO' | 'INACTIVO';
  telefono?: string;
  sedeId?: string;
}

export default function GestionUsuariosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStateChanging, setIsStateChanging] = useState(false);
  const [view, setView] = useState<'all' | 'active' | 'inactive'>('all');
  const [sedeIdFilter, setSedeIdFilter] = useState('');

  const fetchUsuarios = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL_USUARIOS);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error ${response.status}: ${response.statusText}` }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      const data: Usuario[] = await response.json();
      setUsuarios(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo obtener la lista de usuarios.';
      setError(message);
      toast({
        title: 'Error al Cargar Usuarios',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const displayedUsuarios = useMemo(() => {
    let filtered = usuarios;

    if (sedeIdFilter) {
      filtered = filtered.filter(u => u.sedeId?.toLowerCase().includes(sedeIdFilter.toLowerCase()));
    }
    
    switch (view) {
      case 'active':
        return filtered.filter(u => u.estado === 'ACTIVO');
      case 'inactive':
        return filtered.filter(u => u.estado === 'INACTIVO');
      case 'all':
      default:
        return filtered;
    }
  }, [usuarios, view, sedeIdFilter]);


  const handleNavigateToCreateUser = () => {
    router.push('/depreciacion/usuarios/crear');
  };

  const handleNavigateToEditUser = (userId: string) => {
    router.push(`/depreciacion/usuarios/editar/${userId}`);
  };

  const handleChangeStatus = async (usuarioId: string, newStatus: 'ACTIVO' | 'INACTIVO') => {
    setIsStateChanging(true);
    const action = newStatus === 'ACTIVO' ? 'activar' : 'desactivar';
    try {
      const response = await fetch(`${API_BASE_URL_USUARIOS}/${usuarioId}/${action}`, {
        method: 'PUT',
      });

      if (response.ok) {
        const updatedUser = await response.json();
        toast({
          title: `Usuario ${action === 'activar' ? 'Activado' : 'Desactivado'}`,
          description: 'El estado del usuario ha sido actualizado.',
        });
        setUsuarios(prevUsuarios =>
          prevUsuarios.map(u => (u.id === usuarioId ? { ...u, estado: updatedUser.estado } : u))
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

  const formatDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return 'N/A';
    try {
      return new Date(dateTimeString).toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (e) {
      return dateTimeString; 
    }
  };

  return (
    <>
      <div className="px-4 sm:px-6 py-2">
        <h1 className="text-xl font-semibold text-amber-800">Gestión de Usuarios</h1>
      </div>
      <main className="flex flex-1 flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Card className="w-full max-w-full shadow-lg">
          <CardHeader className="bg-amber-100 rounded-t-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
            <div>
              <CardTitle className="text-2xl font-bold text-amber-700 flex items-center">
                <Users className="mr-3 h-7 w-7" />
                Panel de Administración de Usuarios
              </CardTitle>
              <CardDescription className="text-amber-600">
                Administra los usuarios del sistema de depreciación.
              </CardDescription>
            </div>
             <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-2">
                <Input
                  placeholder="Filtrar por Sede ID..."
                  value={sedeIdFilter}
                  onChange={(e) => setSedeIdFilter(e.target.value)}
                  className="w-full sm:w-[180px] bg-white border-amber-300"
                />
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
                <Button onClick={handleNavigateToCreateUser} className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 w-full sm:w-auto">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Crear Nuevo Usuario
                </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading && (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
                <p className="ml-4 text-amber-600">Cargando usuarios...</p>
              </div>
            )}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
                <p className="text-red-700 font-semibold">Error al cargar usuarios</p>
                <p className="text-red-600 text-sm">{error}</p>
                <Button variant="outline" onClick={fetchUsuarios} className="mt-4 text-amber-700 border-amber-300 hover:bg-amber-50">
                  Reintentar
                </Button>
              </div>
            )}
            {!isLoading && !error && displayedUsuarios.length === 0 && (
              <div className="mt-6 border-2 border-dashed border-amber-300 rounded-lg p-10 text-center text-amber-500">
                 <p>
                  No se encontraron usuarios que coincidan con los filtros aplicados.
                </p>
              </div>
            )}
            {!isLoading && !error && displayedUsuarios.length > 0 && (
              <div className="overflow-x-auto mt-6">
                <Table className="min-w-full">
                  <TableHeader className="bg-amber-50">
                    <TableRow>
                      <TableHead className="text-amber-700 font-semibold">Nombre Completo</TableHead>
                      <TableHead className="text-amber-700 font-semibold">DNI</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Correo</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Teléfono</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Sede ID</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Rol</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Estado</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Último Acceso</TableHead>
                      <TableHead className="text-amber-700 font-semibold text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedUsuarios.map((usuario) => {
                       const isActivo = usuario.estado === 'ACTIVO';
                       return(
                      <TableRow key={usuario.id} className="hover:bg-amber-50/50">
                        <TableCell className="text-muted-foreground">{`${usuario.nombre || ''} ${usuario.apellidos || ''}`.trim() || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{usuario.dni || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{usuario.correo || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{usuario.telefono || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{usuario.sedeId || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{usuario.rol || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{usuario.estado || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDateTime(usuario.ultimoAcceso)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-amber-600 border-amber-300 hover:bg-amber-100 hover:text-amber-700" 
                            onClick={() => handleNavigateToEditUser(usuario.id)}
                            disabled={isStateChanging}
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
                                  className={isActivo ? "text-red-500 border-red-300 hover:bg-red-100 hover:text-red-600" : "text-green-500 border-green-300 hover:bg-green-100 hover:text-green-600"}
                                  disabled={isStateChanging}
                                  title={isActivo ? "Desactivar" : "Activar"}
                                >
                                  {isActivo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                  <span className="sr-only">{isActivo ? "Desactivar" : "Activar"}</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>¿Confirmar cambio de estado?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {isActivo 
                                    ? `¿Estás seguro de que quieres desactivar al usuario: "${usuario.nombre || 'este usuario'}"?` 
                                    : `¿Estás seguro de que quieres reactivar al usuario: "${usuario.nombre || 'este usuario'}"?`}
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel disabled={isStateChanging}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                    onClick={() => handleChangeStatus(usuario.id, isActivo ? 'INACTIVO' : 'ACTIVO')}
                                    disabled={isStateChanging}
                                    className={isActivo ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                                >
                                    {isStateChanging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isActivo ? 'Desactivar' : 'Activar'}
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
    
