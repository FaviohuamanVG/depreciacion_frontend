
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

const API_BASE_URL_USUARIOS = 'https://humble-acorn-4j7wv774w4rg2qj4x-8080.app.github.dev/api/usuarios';

interface NewUser {
  nombre: string;
  apellidos: string;
  dni: string;
  correo: string;
  contrasena: string;
  rol: string;
  telefono: string;
  sedeId: string;
}

export default function CrearUsuarioPage() {
  const [newUser, setNewUser] = useState<NewUser>({
    nombre: '',
    apellidos: '',
    dni: '',
    correo: '',
    contrasena: '',
    rol: 'usuario', 
    telefono: '',
    sedeId: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!newUser.correo || !newUser.contrasena || !newUser.nombre || !newUser.dni) {
      setError('Por favor, completa todos los campos obligatorios (Nombre, DNI, Correo, Contraseña).');
      setIsLoading(false);
      toast({ title: 'Error de Validación', description: 'Faltan campos obligatorios.', variant: 'destructive'});
      return;
    }

    try {
      const response = await fetch(API_BASE_URL_USUARIOS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser), 
      });

      if (response.ok || response.status === 201) {
        toast({
          title: 'Usuario Creado',
          description: `El usuario ${newUser.correo} ha sido creado exitosamente.`,
        });
        router.push('/depreciacion/usuarios');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido al crear usuario.' }));
        const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
        setError(errorMessage);
        toast({
          title: 'Error al Crear Usuario',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error("Error al crear usuario:", err);
      const message = err instanceof Error ? err.message : 'No se pudo conectar al servicio.';
      setError(`Error de red: ${message}`);
      toast({
        title: 'Error de Conexión',
        description: `No se pudo conectar al servicio para crear el usuario. ${message}`,
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
          Volver a Gestión de Usuarios
        </Button>
        <h1 className="text-xl font-semibold text-amber-800">Crear Nuevo Usuario</h1>
      </div>
      <main className="flex flex-1 flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="bg-amber-100 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-amber-700 flex items-center">
              <UserPlus className="mr-3 h-7 w-7" />
              Formulario de Nuevo Usuario
            </CardTitle>
            <CardDescription className="text-amber-600">
              Completa los datos para registrar un nuevo usuario en el sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-amber-700">Nombre</Label>
                  <Input id="nombre" name="nombre" type="text" placeholder="Juan" value={newUser.nombre} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidos" className="text-amber-700">Apellidos</Label>
                  <Input id="apellidos" name="apellidos" type="text" placeholder="Pérez" value={newUser.apellidos} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="dni" className="text-amber-700">DNI</Label>
                    <Input id="dni" name="dni" type="text" placeholder="12345678" value={newUser.dni} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-amber-700">Teléfono</Label>
                    <Input id="telefono" name="telefono" type="text" placeholder="987654321" value={newUser.telefono} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="correo" className="text-amber-700">Correo Electrónico</Label>
                <Input id="correo" name="correo" type="email" placeholder="usuario@example.com" value={newUser.correo} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contrasena" className="text-amber-700">Contraseña</Label>
                <Input id="contrasena" name="contrasena" type="password" placeholder="********" value={newUser.contrasena} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="rol" className="text-amber-700">Rol</Label>
                    <Input id="rol" name="rol" type="text" placeholder="usuario / admin" value={newUser.rol} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sedeId" className="text-amber-700">ID de Sede</Label>
                    <Input id="sedeId" name="sedeId" type="text" placeholder="ID de la sede asignada" value={newUser.sedeId} onChange={handleChange} disabled={isLoading} className="border-amber-300 focus:border-amber-500 ring-offset-amber-50" />
                </div>
              </div>

              {error && (
                <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
                  <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              <Button type="submit" className="w-full text-lg py-3 bg-amber-600 hover:bg-amber-700 text-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Creando Usuario...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Crear Usuario
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-xs text-amber-600 p-4 bg-amber-50 rounded-b-lg">
              <p>Asegúrate de que el correo electrónico y DNI sean únicos.</p>
          </CardFooter>
        </Card>
      </main>
    </>
  );
}
