
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, AlertCircle, LogIn, Home, Loader2 } from 'lucide-react';
import Image from 'next/image';

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

export default function RegisterPage() {
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

    if (!newUser.correo || !newUser.contrasena || !newUser.nombre || !newUser.apellidos || !newUser.dni) {
      setError('Please fill in all required fields (Name, Last Name, DNI, Email, Password).');
      setIsLoading(false);
      toast({ title: 'Validation Error', description: 'Required fields are missing.', variant: 'destructive'});
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
          title: 'Registration Successful',
          description: `User ${newUser.correo} has been created. Please log in.`,
        });
        router.push('/'); 
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error creating user.' }));
        const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
        setError(errorMessage);
        toast({
          title: 'Registration Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error("Error creating user:", err);
      const message = err instanceof Error ? err.message : 'Could not connect to the service.';
      setError(`Network error: ${message}`);
      toast({
        title: 'Connection Error',
        description: `Could not connect to the service to create the user. ${message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-lg shadow-2xl">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                    <Image src="https://placehold.co/80x80.png" alt="App Logo" width={80} height={80} className="rounded-full" data-ai-hint="modern logo"/>
                </div>
                <CardTitle className="text-3xl font-headline">Create Account</CardTitle>
                <CardDescription>Register to access the Depreciation App.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                        <Label htmlFor="nombre">Name</Label>
                        <Input id="nombre" name="nombre" type="text" placeholder="John" value={newUser.nombre} onChange={handleChange} disabled={isLoading} />
                        </div>
                        <div className="space-y-1">
                        <Label htmlFor="apellidos">Last Name</Label>
                        <Input id="apellidos" name="apellidos" type="text" placeholder="Doe" value={newUser.apellidos} onChange={handleChange} disabled={isLoading} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="dni">DNI</Label>
                            <Input id="dni" name="dni" type="text" placeholder="12345678" value={newUser.dni} onChange={handleChange} disabled={isLoading} />
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="telefono">Phone</Label>
                            <Input id="telefono" name="telefono" type="text" placeholder="987654321" value={newUser.telefono} onChange={handleChange} disabled={isLoading} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="correo">Email</Label>
                        <Input id="correo" name="correo" type="email" placeholder="you@example.com" value={newUser.correo} onChange={handleChange} disabled={isLoading} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="contrasena">Password</Label>
                        <Input id="contrasena" name="contrasena" type="password" placeholder="********" value={newUser.contrasena} onChange={handleChange} disabled={isLoading} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="rol">Role (default: usuario)</Label>
                            <Input id="rol" name="rol" type="text" value={newUser.rol} onChange={handleChange} disabled={isLoading} />
                            <p className="text-xs text-muted-foreground">Admins can change roles later.</p>
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="sedeId">Sede ID</Label>
                            <Input id="sedeId" name="sedeId" type="text" placeholder="Assigned Sede ID" value={newUser.sedeId} onChange={handleChange} disabled={isLoading} />
                        </div>
                    </div>
                    
                    {error && (
                        <div className="flex items-center p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
                        <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                        <p>{error}</p>
                        </div>
                    )}
                    <Button type="submit" className="w-full text-lg py-3" disabled={isLoading}>
                        {isLoading ? (
                        <>
                           <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                            Registering...
                        </>
                        ) : (
                        <>
                            <UserPlus className="mr-2 h-5 w-5" />
                            Register
                        </>
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center space-y-2 text-sm pt-4">
                 <Link href="/" className="text-primary hover:underline flex items-center">
                    <LogIn className="mr-1 h-4 w-4" /> Already have an account? Sign In
                </Link>
                <p className="text-muted-foreground">&copy; {new Date().getFullYear()} Multi-App Suite. All rights reserved.</p>
            </CardFooter>
        </Card>
    </div>
  );
}
