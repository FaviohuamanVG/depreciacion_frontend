
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Building, ShoppingBasket, LogOut, ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface User {
  nombre?: string;
  apellido?: string;
  correo?: string;
  rol?: string;
  // Add other fields from your backend Usuario model if needed
}

export default function SeleccionarDestinoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('loggedInUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Failed to parse user from localStorage", error);
          router.push('/'); // Redirect to login if data is malformed
        }
      } else {
        router.push('/'); // Redirect to login if no user data
      }
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('loggedInUser');
    }
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-muted-foreground">Cargando datos del usuario...</p>
      </div>
    );
  }

  if (!user) {
    // This case should ideally be handled by the redirect in useEffect,
    // but it's a fallback.
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
             <p className="text-destructive">Datos del usuario no encontrados. Redirigiendo al login...</p>
        </div>
    );
  }
  
  const displayName = user.nombre ? `${user.nombre}${user.apellido ? ' ' + user.apellido : ''}` : user.correo || 'Usuario';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-stone-200 p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center bg-gray-50 rounded-t-lg">
          <div className="mx-auto mb-3">
            <Image src="https://placehold.co/72x72.png" alt="Profile" width={72} height={72} className="rounded-full border-2 border-primary" data-ai-hint="user avatar placeholder" />
          </div>
          <CardTitle className="text-3xl font-headline text-primary">¡Bienvenido, {displayName}!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Selecciona a dónde quieres ir:
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Botón de Depreciación siempre visible para usuarios logueados via backend */}
          <Button 
            onClick={() => router.push('/depreciacion')} 
            className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground"
            variant="default"
            size="lg"
          >
            <Building className="mr-3 h-6 w-6" />
            Gestión de Depreciación
            <ArrowRight className="ml-auto h-5 w-5" />
          </Button>
          
           {/* Botón de Pedido de Pollo siempre visible */}
           <Button 
            onClick={() => router.push('/pedido-pollo')} 
            className="w-full text-lg py-6 bg-orange-500 hover:bg-orange-600 text-white"
            variant="default" 
            size="lg"
          >
            <ShoppingBasket className="mr-3 h-6 w-6" />
            Realizar Pedido de Pollo
            <ArrowRight className="ml-auto h-5 w-5" />
          </Button>

        </CardContent>
        <CardFooter className="p-6 border-t bg-gray-50 rounded-b-lg">
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            className="w-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Cerrar Sesión
          </Button>
        </CardFooter>
      </Card>
      <p className="mt-8 text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Multi-App Suite. Todos los derechos reservados.</p>
    </div>
  );
}
