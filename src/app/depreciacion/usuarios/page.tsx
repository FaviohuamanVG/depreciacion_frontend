
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_BASE_URL_USUARIOS = 'https://humble-acorn-4j7wv774w4rg2qj4x-8080.app.github.dev/api/usuarios';

export default function GestionUsuariosPage() {
  const router = useRouter();

  const handleNavigateToCreateUser = () => {
    router.push('/depreciacion/usuarios/crear');
  };

  // En el futuro, aquí podrías añadir la lógica para listar usuarios
  // const [users, setUsers] = useState([]);
  // useEffect(() => {
  //   fetch(`${API_BASE_URL_USUARIOS}`)
  //     .then(res => res.json())
  //     .then(data => setUsers(data));
  // }, []);

  return (
    <>
      <div className="px-4 sm:px-6 py-2">
        <h1 className="text-xl font-semibold text-amber-800">Gestión de Usuarios</h1>
      </div>
      <main className="flex flex-1 flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Card className="w-full max-w-3xl shadow-lg">
          <CardHeader className="bg-amber-100 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-amber-700 flex items-center">
              <Users className="mr-3 h-7 w-7" />
              Panel de Administración de Usuarios
            </CardTitle>
            <CardDescription className="text-amber-600">
              Administra los usuarios del sistema de depreciación.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <Button onClick={handleNavigateToCreateUser} className="bg-amber-600 hover:bg-amber-700 text-white">
                <UserPlus className="mr-2 h-5 w-5" />
                Crear Nuevo Usuario
              </Button>
            </div>
            
            <div className="mt-6 border-2 border-dashed border-amber-300 rounded-lg p-10 text-center text-amber-500">
              <p>Próximamente: Listado de usuarios aquí.</p>
              {/* Aquí podrías mapear y mostrar la lista de usuarios */}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
