
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Save, AlertCircle, ArrowLeft, Loader2, UserCog } from 'lucide-react';

const API_BASE_URL_USUARIOS = 'https://humble-acorn-4j7wv774w4rg2qj4x-8080.app.github.dev/api/usuarios';

interface EditableUser {
  id: string;
  nombre: string;
  apellidos: string;
  dni: string;
  correo: string;
  rol: string;
  telefono?: string;
  sedeId?: string;
}

// TODO: Replace with an API call to fetch actual sedes
const sedes = [
  { id: 'S001', nombre: 'Sede Principal - Centro' },
  { id: 'S002', nombre: 'Sucursal Norte' },
  { id: 'S003', nombre: 'Sucursal Sur' },
  { id: 'S004', nombre: 'Almacén Central' },
];


export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<EditableUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setError('ID de usuario no encontrado.');
      setIsFetching(false);
      toast({ title: 'Error', description: 'No se proporcionó un ID de usuario.', variant: 'destructive' });
      router.push('/depreciacion/usuarios');
      return;
    }

    const fetchUserDetails = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL_USUARIOS}/${userId}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error('Usuario no encontrado.');
          const errorData = await response.json().catch(() => ({ message: `Error ${response.status}: ${response.statusText}` }));
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }
        const data: EditableUser = await response.json();
        setUser(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo obtener los detalles del usuario.';
        setError(message);
        toast({
          title: 'Error al Cargar Usuario',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserDetails();
  }, [userId, router, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const { name, value } = e.target;
    setUser(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  const handleSelectChange = (name: keyof EditableUser, value: string) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('No hay datos de usuario para actualizar.');
      return;
    }
    setError(null);
    setIsLoading(true);

    if (!user.correo || !user.nombre || !user.dni || !user.rol || !user.sedeId) {
      setError('Por favor, completa todos los campos obligatorios (Nombre, DNI, Correo, Rol, Sede).');
      setIsLoading(false);
      toast({ title: 'Error de Validación', description: 'Faltan campos obligatorios.', variant: 'destructive'});
      return;
    }

    try {
      const { id, ...updatePayload } = user; 

      const response = await fetch(`${API_BASE_URL_USUARIOS}/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload), 
      });

      if (response.ok) {
        toast({
          title: 'Usuario Actualizado',
          description: `El usuario ${user.correo} ha sido actualizado exitosamente.`,
        });
        router.push('/depreciacion/usuarios');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido al actualizar usuario.' }));
        const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
        setError(errorMessage);
        toast({
          title: 'Error al Actualizar Usuario',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      const message = err instanceof Error ? err.message : 'No se pudo conectar al servicio.';
      setError(`Error de red: ${message}`);
      toast({
        title: 'Error de Conexión',
        description: `No se pudo conectar al servicio para actualizar el usuario. ${message}`,
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
        <p className="ml-4 text-amber-600">Cargando datos del usuario...</p>
      </div>
    );
  }

  if (error && !user) {
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
            <Button variant="outline" onClick={() => router.push('/depreciacion/usuarios')} className="mt-4 text-amber-700 border-amber-300 hover:bg-amber-50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Listado
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }
  
  if (!user) {
    return (
        <div className="flex flex-1 justify-center items-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
            <p className="text-amber-700">No se encontraron datos del usuario para editar.</p>
            <Button variant="link" onClick={() => router.push('/depreciacion/usuarios')} className="mt-2">Volver al listado</Button>
        </div>
    );
  }


  return (
    <>
      <div className="px-4 sm:px-6 py-2">
        <Button variant="outline" onClick={() => router.push('/depreciacion/usuarios')} className="mb-4 text-amber-700 border-amber-300 hover:bg-amber-50">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Gestión de Usuarios
        </Button>
        <h1 className="text-xl font-semibold text-amber-800">Editar Usuario</h1>
      </div>
      <main className="flex flex-1 flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="bg-amber-100 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-amber-700 flex items-center">
              <UserCog className="mr-3 h-7 w-7" />
              Formulario de Edición de Usuario
            </CardTitle>
            <CardDescription className="text-amber-600">
              Modifica los datos del usuario. El ID es: {user.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-amber-700">Nombre</Label>
                  <Input id="nombre" name="nombre" type="text" placeholder="Juan" value={user.nombre || ''} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidos" className="text-amber-700">Apellidos</Label>
                  <Input id="apellidos" name="apellidos" type="text" placeholder="Pérez" value={user.apellidos || ''} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="dni" className="text-amber-700">DNI</Label>
                    <Input id="dni" name="dni" type="text" placeholder="12345678" value={user.dni || ''} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-amber-700">Teléfono</Label>
                    <Input id="telefono" name="telefono" type="text" placeholder="987654321" value={user.telefono || ''} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="correo" className="text-amber-700">Correo Electrónico</Label>
                <Input id="correo" name="correo" type="email" placeholder="usuario@example.com" value={user.correo || ''} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="rol" className="text-amber-700">Rol</Label>
                    <Input id="rol" name="rol" type="text" placeholder="usuario / admin" value={user.rol || ''} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sedeId" className="text-amber-700">Sede</Label>
                    <Select
                      value={user.sedeId || ''}
                      onValueChange={(value) => handleSelectChange('sedeId', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full border-amber-300 focus:border-amber-500 ring-offset-amber-50">
                        <SelectValue placeholder="Seleccione una sede" />
                      </SelectTrigger>
                      <SelectContent>
                        {sedes.map(sede => (
                          <SelectItem key={sede.id} value={sede.id}>{sede.nombre}</SelectItem>
                        ))}
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
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
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
              <p>Asegúrate de que el correo electrónico y DNI sean únicos si los modificas.</p>
          </CardFooter>
        </Card>
      </main>
    </>
  );
}

    