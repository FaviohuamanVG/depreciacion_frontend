
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, AlertCircle, Building, BarChartBig, UserPlus } from 'lucide-react';
import Image from 'next/image';

// API base URL for user authentication
const API_BASE_URL_USUARIOS = 'https://humble-acorn-4j7wv774w4rg2qj4x-8080.app.github.dev/api/usuarios';

export default function LoginPage() {
  const [username, setUsername] = useState(''); // This will be used as 'correo' for the backend
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Client-side check for Sentiment Analysis App
    if (username === 'admin' && password === 'password') {
      toast({
        title: 'Login Successful',
        description: `Redirecting to Sentiment Analysis...`,
      });
      router.push('/sentiment');
      setIsLoading(false);
      return;
    }

    // Attempt login via backend API for Depreciation App
    try {
      const response = await fetch(`${API_BASE_URL_USUARIOS}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo: username, contrasena: password }),
      });

      if (response.ok) {
        // const data = await response.json(); // Contains token and user info, can be used later
        toast({
          title: 'Login Successful',
          description: `Redirecting to Asset Depreciation (Pollería)...`,
        });
        router.push('/depreciacion');
      } else if (response.status === 401) {
        setError('Invalid email or password for Depreciation App. Please try again.');
        toast({
          title: 'Login Failed',
          description: 'Invalid email or password for Depreciation App.',
          variant: 'destructive',
        });
      } else {
        const errorText = await response.text();
        setError(`Login failed: ${errorText || 'Unknown error'}`);
        toast({
          title: 'Login Failed',
          description: `An error occurred: ${errorText || 'Unknown error'}`,
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error("Login API call failed:", err);
      setError('Failed to connect to the login service. Please try again later.');
      toast({
        title: 'Login Error',
        description: 'Could not connect to the login service.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Image src="https://placehold.co/80x80.png" alt="App Logo" width={80} height={80} className="rounded-full" data-ai-hint="modern logo" />
          </div>
          <CardTitle className="text-3xl font-headline">Welcome!</CardTitle>
          <CardDescription>Please enter your credentials to access the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username / Email</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin OR your_email@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="password OR your_depreciation_password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="text-base"
              />
            </div>
            {error && (
              <div className="flex items-center p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
                <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In
                </>
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/register" className="text-sm text-primary hover:underline">
                Don&apos;t have an account? Register here
            </Link>
          </div>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground flex-col space-y-2 pt-6">
            <div className="space-y-1">
              <p className="font-semibold">Login Details:</p>
              <p><BarChartBig className="inline-block mr-1 h-4 w-4 text-primary" />Sentiment App: <code className="bg-muted px-1 rounded-sm">admin</code> / <code className="bg-muted px-1 rounded-sm">password</code></p>
              <p><Building className="inline-block mr-1 h-4 w-4 text-primary" />Depreciation App: Use your registered email and password (connects to backend API).</p>
            </div>
            <p className="mt-2">&copy; {new Date().getFullYear()} Multi-App Suite. All rights reserved.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
