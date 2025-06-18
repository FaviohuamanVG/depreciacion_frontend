
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquareText, Edit, Trash2, PlusCircle, AlertCircle, Search, Undo2, LogOut } from 'lucide-react'; // Import LogOut
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Base URL for your Spring Boot backend's sentiment API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_SENTIMIENTOS_URL || 'https://8080-firebase-cognitiveapisgit-1748893329986.cluster-4xpux6pqdzhrktbhjf2cumyqtg.cloudworkstations.dev/api/sentimientos';

interface ApiInteraction {
  id?: string; // Optional ID field
  apiName?: string;
  input: string;
  output?: string;
  sentiment?: string;
  estadoapi?: string;
  timestamp?: string;
  errorMessage?: string;
  positiveScore?: number;
  neutralScore?: number;
  negativeScore?: number;
}

export default function SentimentCrudPage() {
  const [sentimientos, setSentimientos] = useState<ApiInteraction[]>([]);
  const [newText, setNewText] = useState<string>('');

  const [editingInteraction, setEditingInteraction] = useState<ApiInteraction | null>(null);
  const [editText, setEditText] = useState<string>('');

  const [interactionToSearch, setInteractionToSearch] = useState<string>('');
  const [searchedInteraction, setSearchedInteraction] = useState<ApiInteraction | null>(null);


  const [isLoading, setIsLoading] = useState({
    create: false,
    read: true,
    update: false,
    delete: false,
    search: false,
    restore: false,
  });
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter(); // Initialize useRouter

  // Handle sign out
  const handleSignOut = () => {
    router.push('/');
  };

  // Fetch all sentimientos
  const fetchSentimientos = async () => {
    setIsLoading(prev => ({ ...prev, read: true }));
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/all`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      const data: ApiInteraction[] = await response.json();
      setSentimientos(data.sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sentimientos.';
      setError(errorMessage);
      toast({ title: 'Error Fetching Data', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(prev => ({ ...prev, read: false }));
    }
  };

  useEffect(() => {
    fetchSentimientos();
  }, []);

  // Create new sentimiento
  const handleCreateSentimiento = async (e: FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) {
      toast({ title: 'Input Required', description: 'Please enter text to analyze.', variant: 'destructive' });
      return;
    }
    setIsLoading(prev => ({ ...prev, create: true }));
    setError(null);
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newText),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      fetchSentimientos();
      setNewText('');
      toast({ title: 'Success', description: 'Sentiment analyzed and saved.' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create sentimiento.';
      setError(errorMessage);
      toast({ title: 'Creation Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(prev => ({ ...prev, create: false }));
    }
  };

  // Handle search by ID
  const handleSearchById = async () => {
    if (!interactionToSearch.trim()) {
      toast({ title: 'Input Required', description: 'Please enter an ID to search.', variant: 'destructive' });
      return;
    }
    setIsLoading(prev => ({...prev, search: true}));
    setSearchedInteraction(null);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${interactionToSearch}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Interaction not found.');
        }
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      const data: ApiInteraction = await response.json();
      setSearchedInteraction(data);
      toast({ title: 'Search Successful', description: `Found interaction ID: ${data.id}`});
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search interaction.';
      setError(errorMessage);
      setSearchedInteraction(null);
      toast({ title: 'Search Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(prev => ({...prev, search: false}));
    }
  };

  // Open edit modal
  const openEditModal = (interaction: ApiInteraction) => {
    if (interaction.estadoapi === 'INACTIVO') {
       toast({ title: 'Action Denied', description: 'Cannot edit a deactivated item. Please restore it first.', variant: 'default' });
      return;
    }
    setEditingInteraction(interaction);
    setEditText(interaction.input);
  };

  // Update sentimiento
  const handleUpdateSentimiento = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingInteraction || !editText.trim()) return;
    setIsLoading(prev => ({ ...prev, update: true }));
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${editingInteraction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editText),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      fetchSentimientos();
      setEditingInteraction(null);
      toast({ title: 'Success', description: 'Sentimiento updated.' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update sentimiento.';
      setError(errorMessage);
      toast({ title: 'Update Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(prev => ({ ...prev, update: false }));
    }
  };

  // Deactivate/Logical Delete sentimiento
  const handleDeactivateSentimiento = async (id: string) => {
    setIsLoading(prev => ({ ...prev, delete: true }));
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/deactivate/${id}`, {
        method: 'PUT',
      });
      if (response.status === 204 || response.ok) {
        fetchSentimientos();
        toast({ title: 'Success', description: 'Sentimiento marked as deactivated.' });
      } else {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deactivate sentimiento.';
      setError(errorMessage);
      toast({ title: 'Deactivation Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // Restore sentimiento
  const handleRestoreSentimiento = async (id: string) => {
    setIsLoading(prev => ({ ...prev, restore: true }));
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/restore/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      fetchSentimientos();
      toast({ title: 'Success', description: 'Sentimiento restored.' });
    } finally {
      setIsLoading(prev => ({ ...prev, restore: false }));
    }
  };


  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex justify-between items-center p-4 border-b shadow-sm sticky top-0 bg-card z-10">
        <div>
          <h1 className="text-xl font-semibold">Sentiment Text CRUD</h1>
          <p className="text-sm text-muted-foreground">
            Manage text entries and their sentiment analysis. Fetches from <code className="bg-muted px-1 rounded-sm">{`${API_BASE_URL}/all`}</code>
          </p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-y-auto">
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><PlusCircle className="mr-2 h-5 w-5 text-primary" />Analyze & Save New Text</CardTitle>
            <CardDescription>Enter text to analyze its sentiment and store it.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSentimiento} className="space-y-4">
              <Textarea
                placeholder="Enter text here..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                rows={5}
                className="resize-none"
                disabled={isLoading.create}
              />
              <Button type="submit" disabled={isLoading.create} className="w-full">
                {isLoading.create ? <Loader2 className="animate-spin mr-2" /> : <MessageSquareText className="mr-2 h-4 w-4" />}
                {isLoading.create ? 'Analyzing & Saving...' : 'Analyze & Save'}
              </Button>
            </form>
          </CardContent>
        </Card>

        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Search className="mr-2 h-5 w-5 text-primary" />Search Interaction by ID</CardTitle>
            <CardDescription>Enter an ID to fetch a specific interaction.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Enter Interaction ID"
                value={interactionToSearch}
                onChange={(e) => setInteractionToSearch(e.target.value)}
                disabled={isLoading.search}
              />
              <Button onClick={handleSearchById} disabled={isLoading.search}>
                {isLoading.search ? <Loader2 className="animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            {isLoading.search && <div className="flex justify-center py-2"><Loader2 className="animate-spin text-primary" /></div>}
            {searchedInteraction && !isLoading.search && (
              <Card className={cn("bg-secondary/30", searchedInteraction.estadoapi === 'INACTIVO' && "opacity-60")}>
                <CardHeader>
                  <CardTitle className="text-base">ID: {searchedInteraction.id} {searchedInteraction.estadoapi === 'INACTIVO' && <span className="text-xs text-destructive ml-2">(Deactivated)</span>}</CardTitle>
                  <CardDescription>Timestamp: {searchedInteraction.timestamp ? new Date(searchedInteraction.timestamp).toLocaleString() : 'N/A'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p className={cn(searchedInteraction.estadoapi === 'INACTIVO' && "line-through")}><strong>Text:</strong> {searchedInteraction.input}</p>
                  <p><strong>Sentiment:</strong> <span className={`font-semibold ${searchedInteraction.sentiment === 'positive' ? 'text-green-600' : searchedInteraction.sentiment === 'negative' ? 'text-red-600' : searchedInteraction.sentiment === 'neutral' ? 'text-yellow-600' : ''}`}>{searchedInteraction.sentiment || 'N/A'}</span></p>
                  <p><strong>Estado API:</strong> {searchedInteraction.estadoapi}</p>
                  {searchedInteraction.errorMessage && <p><strong>Error Message:</strong> {searchedInteraction.errorMessage}</p>}
                  {searchedInteraction.output && <p><strong>Output:</strong> {searchedInteraction.output}</p>}
                </CardContent>
              </Card>
            )}
            {!isLoading.search && error && interactionToSearch && !searchedInteraction && <p className="text-destructive text-sm mt-2 flex items-center"><AlertCircle className="mr-1 h-4 w-4" />{error}</p>}
          </CardContent>
        </Card>


        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Stored Sentiment Texts</CardTitle>
            <CardDescription>View, edit, or deactivate/restore stored text entries.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading.read && <div className="flex justify-center py-4"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}
            {!isLoading.read && error && sentimientos.length === 0 && <p className="text-destructive flex items-center"><AlertCircle className="mr-1 h-4 w-4" />{error}</p>}
            {!isLoading.read && !error && sentimientos.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No sentiment texts found. Add some!</p>
            )}
            {!isLoading.read && !error && sentimientos.length > 0 && (
              <ScrollArea className="h-[400px] lg:h-[500px] pr-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Text</TableHead>
                      <TableHead>Sentiment</TableHead>
                      <TableHead>Estado API</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sentimientos.map((s) => (
                      <TableRow key={s.id} className={cn(s.estadoapi === 'INACTIVO' && "opacity-50")}>
                        <TableCell className={cn("font-medium truncate max-w-xs", s.estadoapi === 'INACTIVO' && "line-through")}>{s.input}</TableCell>
                        <TableCell>
                          <span className={`font-semibold ${s.sentiment === 'positive' ? 'text-green-600' : s.sentiment === 'negative' ? 'text-red-600' : s.sentiment === 'neutral' ? 'text-yellow-600' : ''}`}>
                            {s.sentiment || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>{s.estadoapi} {s.estadoapi === 'INACTIVO' && <span className="text-xs text-destructive ml-1">(Deactivated)</span>}</TableCell>
                        <TableCell>{s.timestamp ? new Date(s.timestamp).toLocaleString() : 'N/A'}</TableCell>
                        <TableCell className="text-right space-x-2">
                          {s.estadoapi !== 'INACTIVO' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="icon" onClick={() => openEditModal(s)} disabled={isLoading.update || isLoading.delete || isLoading.restore || s.estadoapi === 'INACTIVO'}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              
                            </Dialog>
                          )}
                          {s.estadoapi === 'INACTIVO' ? (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => s.id && handleRestoreSentimiento(s.id)}
                              disabled={isLoading.restore || isLoading.delete || isLoading.update}
                              title="Restore"
                            >
                              {isLoading.restore ? <Loader2 className="animate-spin h-4 w-4" /> : <Undo2 className="h-4 w-4" />}
                            </Button>
                          ) : (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="destructive" size="icon" disabled={isLoading.update || isLoading.delete || isLoading.restore}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Confirm Deactivation</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to mark this text entry as deactivated? It can be restored later.
                                    <br/><strong>Text:</strong> {s.input}
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <DialogClose asChild>
                                    <Button
                                      variant="destructive"
                                      onClick={() => {
                                          if(s.id) {
                                            handleDeactivateSentimiento(s.id);
                                          }
                                      }}
                                      disabled={isLoading.delete}
                                    >
                                      {isLoading.delete && <Loader2 className="animate-spin mr-2" />}
                                      Deactivate
                                    </Button>
                                  </DialogClose>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      
      {editingInteraction && editingInteraction.estadoapi !== 'INACTIVO' && (
        <Dialog open={!!editingInteraction && editingInteraction.estadoapi !== 'INACTIVO'} onOpenChange={(isOpen) => !isOpen && setEditingInteraction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Sentiment Text</DialogTitle>
              <DialogDescription>Modify the text and re-analyze its sentiment.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateSentimiento} className="space-y-4 py-4">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={5}
                className="resize-none"
                disabled={isLoading.update}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingInteraction(null)} disabled={isLoading.update}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading.update}>
                  {isLoading.update && <Loader2 className="animate-spin mr-2" />}
                  Update & Re-analyze
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
    
