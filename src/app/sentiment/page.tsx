
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquareText, Edit, Trash2, PlusCircle, AlertCircle, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Base URL for your Spring Boot backend's sentiment API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_SENTIMIENTOS_URL || 'http://localhost:8080/api/sentimientos';

interface ApiInteraction {
  id?: string;
  apiName?: string; // May not be directly used by this controller, but kept for consistency
  requestPayload: string; // The text analyzed
  responsePayload?: string; // Backend response message
  sentiment?: string; // "positive", "negative", "neutral"
  status?: string; // "success", "error"
  timestamp?: string; // ISO date string
  errorMessage?: string;
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
  });
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all sentimientos
  const fetchSentimientos = async () => {
    setIsLoading(prev => ({ ...prev, read: true }));
    setError(null);
    try {
      const response = await fetch(API_BASE_URL);
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
        headers: { 'Content-Type': 'application/json' }, // Assuming backend expects JSON with a field
        body: JSON.stringify(newText), // Send as raw string, as per controller: @RequestBody String texto
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      const created: ApiInteraction = await response.json();
      // setSentimientos(prev => [created, ...prev].sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()));
      fetchSentimientos(); // Refetch to get the latest list with ID and timestamp
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
      toast({ title: 'Search Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(prev => ({...prev, search: false}));
    }
  };


  // Open edit modal
  const openEditModal = (interaction: ApiInteraction) => {
    setEditingInteraction(interaction);
    setEditText(interaction.requestPayload);
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
        body: JSON.stringify(editText), // Send as raw string
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      const updated: ApiInteraction = await response.json();
      // setSentimientos(prev => prev.map(s => s.id === updated.id ? updated : s).sort((a,b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()));
      fetchSentimientos(); // Refetch to ensure data consistency
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

  // Delete sentimiento
  const handleDeleteSentimiento = async (id: string) => {
    setIsLoading(prev => ({ ...prev, delete: true }));
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
         if (response.status === 204) { // No Content, successful deletion
             // Proceed as success
         } else {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
         }
      }
      // setSentimientos(prev => prev.filter(s => s.id !== id));
      fetchSentimientos(); // Refetch
      toast({ title: 'Success', description: 'Sentimiento deleted.' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete sentimiento.';
      setError(errorMessage);
      toast({ title: 'Deletion Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(prev => ({ ...prev, delete: false }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b shadow-sm sticky top-0 bg-card z-10">
        <h1 className="text-xl font-semibold">Sentiment Text CRUD</h1>
        <p className="text-sm text-muted-foreground">
          Manage text entries and their sentiment analysis via <code className="bg-muted px-1 rounded-sm">{API_BASE_URL}</code>
        </p>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-y-auto">
        {/* Create Section */}
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

        {/* Search Section */}
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
            {isLoading.search && <Loader2 className="animate-spin text-primary mx-auto my-2" />}
            {searchedInteraction && !isLoading.search && (
              <Card className="bg-secondary/30">
                <CardHeader>
                  <CardTitle className="text-base">ID: {searchedInteraction.id}</CardTitle>
                  <CardDescription>Timestamp: {searchedInteraction.timestamp ? new Date(searchedInteraction.timestamp).toLocaleString() : 'N/A'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p><strong>Text:</strong> {searchedInteraction.requestPayload}</p>
                  <p><strong>Sentiment:</strong> <span className={`font-semibold ${searchedInteraction.sentiment === 'positive' ? 'text-green-600' : searchedInteraction.sentiment === 'negative' ? 'text-red-600' : searchedInteraction.sentiment === 'neutral' ? 'text-yellow-600' : ''}`}>{searchedInteraction.sentiment || 'N/A'}</span></p>
                  <p><strong>Status:</strong> {searchedInteraction.status}</p>
                  {searchedInteraction.errorMessage && <p><strong>Error Message:</strong> {searchedInteraction.errorMessage}</p>}
                  {searchedInteraction.responsePayload && <p><strong>Response:</strong> {searchedInteraction.responsePayload}</p>}
                </CardContent>
              </Card>
            )}
            {!isLoading.search && error && interactionToSearch && <p className="text-destructive text-sm mt-2 flex items-center"><AlertCircle className="mr-1 h-4 w-4" />{error}</p>}

          </CardContent>
        </Card>


        {/* List Section */}
        <Card className="lg:col-span-2"> {/* Make list span both columns on large screens */}
          <CardHeader>
            <CardTitle>Stored Sentiment Texts</CardTitle>
            <CardDescription>View, edit, or delete stored text entries.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading.read && <div className="flex justify-center py-4"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}
            {!isLoading.read && error && <p className="text-destructive flex items-center"><AlertCircle className="mr-1 h-4 w-4" />{error}</p>}
            {!isLoading.read && !error && sentimientos.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No sentiment texts found. Add some!</p>
            )}
            {!isLoading.read && !error && sentimientos.length > 0 && (
              <ScrollArea className="h-[400px] lg:h-[500px] pr-3"> {/* Added pr-3 for scrollbar spacing */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Text</TableHead>
                      <TableHead>Sentiment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sentimientos.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium truncate max-w-xs">{s.requestPayload}</TableCell>
                        <TableCell>
                          <span className={`font-semibold ${s.sentiment === 'positive' ? 'text-green-600' : s.sentiment === 'negative' ? 'text-red-600' : s.sentiment === 'neutral' ? 'text-yellow-600' : ''}`}>
                            {s.sentiment || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>{s.status}</TableCell>
                        <TableCell>{s.timestamp ? new Date(s.timestamp).toLocaleString() : 'N/A'}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon" onClick={() => openEditModal(s)} disabled={isLoading.update || isLoading.delete}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            {/* Edit Dialog Content is now separate for clarity */}
                          </Dialog>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="icon" disabled={isLoading.update || isLoading.delete}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirm Deletion</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this text entry? This action cannot be undone.
                                  <br/><strong>Text:</strong> {s.requestPayload}
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                      if(s.id) handleDeleteSentimiento(s.id);
                                      // Find a way to close dialog after action:
                                      // This might require managing open state of this specific dialog.
                                      // For now, it will close if handleDeleteSentimiento is successful
                                      // and list re-renders. A more robust solution might involve
                                      // passing a close callback or managing Dialog's open prop.
                                  }}
                                  disabled={isLoading.delete}
                                >
                                  {isLoading.delete && <Loader2 className="animate-spin mr-2" />}
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
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

      {/* Edit Modal */}
      {editingInteraction && (
        <Dialog open={!!editingInteraction} onOpenChange={(isOpen) => !isOpen && setEditingInteraction(null)}>
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
    
