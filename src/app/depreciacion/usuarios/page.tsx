
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, UserPlus, AlertCircle, Loader2, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL_USUARIOS = 'https://humble-acorn-4j7wv774w4rg2qj4x-8080.app.github.dev/api/usuarios';

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  correo: string;
  rol: string;
  ultimoAcceso: string; // Asumiendo que el backend devuelve la fecha como string ISO
}

export default function GestionUsuariosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleNavigateToCreateUser = () => {
    router.push('/depreciacion/usuarios/crear');
  };

  const handleNavigateToEditUser = (userId: string) => {
    router.push(`/depreciacion/usuarios/editar/${userId}`);
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
        <Card className="w-full max-w-5xl shadow-lg">
          <CardHeader className="bg-amber-100 rounded-t-lg flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-amber-700 flex items-center">
                <Users className="mr-3 h-7 w-7" />
                Panel de Administración de Usuarios
              </CardTitle>
              <CardDescription className="text-amber-600">
                Administra los usuarios del sistema de depreciación.
              </CardDescription>
            </div>
            <Button onClick={handleNavigateToCreateUser} className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
              <UserPlus className="mr-2 h-5 w-5" />
              Crear Nuevo Usuario
            </Button>
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
            {!isLoading && !error && usuarios.length === 0 && (
              <div className="mt-6 border-2 border-dashed border-amber-300 rounded-lg p-10 text-center text-amber-500">
                <p>No se encontraron usuarios. ¡Empieza creando uno!</p>
              </div>
            )}
            {!isLoading && !error && usuarios.length > 0 && (
              <div className="overflow-x-auto mt-6">
                <Table className="min-w-full">
                  <TableHeader className="bg-amber-50">
                    <TableRow>
                      <TableHead className="text-amber-700 font-semibold">Nombre Completo</TableHead>
                      <TableHead className="text-amber-700 font-semibold">DNI</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Correo</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Rol</TableHead>
                      <TableHead className="text-amber-700 font-semibold">Último Acceso</TableHead>
                      <TableHead className="text-amber-700 font-semibold text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map((usuario) => (
                      <TableRow key={usuario.id} className="hover:bg-amber-50/50">
                        <TableCell className="text-muted-foreground">{`${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{usuario.dni || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{usuario.correo || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{usuario.rol || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDateTime(usuario.ultimoAcceso)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-amber-600 border-amber-300 hover:bg-amber-100 hover:text-amber-700" 
                            onClick={() => handleNavigateToEditUser(usuario.id)}
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-red-500 border-red-300 hover:bg-red-100 hover:text-red-600" 
                            onClick={() => toast({title: 'Próximamente', description: 'Funcionalidad de eliminar estará disponible pronto.'})}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
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
