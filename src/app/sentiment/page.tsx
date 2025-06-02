
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquareText, ListFilter, AlertCircle, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Placeholder for your Spring Boot backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

interface ApiInteraction {
  id?: string;
  apiName: string;
  requestPayload: string;
  responsePayload: string;
  sentiment?: string;
  status: string;
  timestamp?: string; 
  errorMessage?: string;
}

export default function SentimentAnalyzerPage() {
  const [textToAnalyze, setTextToAnalyze] = useState<string>('');
  const [apiNameFilter, setApiNameFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [analysisResult, setAnalysisResult] = useState<ApiInteraction | null>(null);
  const [interactionsList, setInteractionsList] = useState<ApiInteraction[]>([]);
  
  const [loadingStates, setLoadingStates] = useState({
    analyze: false,
    all: false,
    byApi: false,
    byStatus: false,
  });
  const [errorMessages, setErrorMessages] = useState({
    analyze: '',
    interactions: '',
  });

  const { toast } = useToast();

  const handleAnalyzeSentiment = async () => {
    if (!textToAnalyze.trim()) {
      toast({ title: 'Input Required', description: 'Please enter text to analyze.', variant: 'destructive' });
      return;
    }
    setLoadingStates(prev => ({ ...prev, analyze: true }));
    setErrorMessages(prev => ({ ...prev, analyze: '' }));
    setAnalysisResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/interactions/analizar?texto=${encodeURIComponent(textToAnalyze)}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      const data: ApiInteraction = await response.json();
      setAnalysisResult(data);
      // Sentiment is now displayed prominently in the result area
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during analysis';
      setErrorMessages(prev => ({ ...prev, analyze: errorMessage }));
      toast({ title: 'Analysis Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setLoadingStates(prev => ({ ...prev, analyze: false }));
    }
  };

  const fetchInteractions = async (type: 'all' | 'byApi' | 'byStatus') => {
    let url = `${API_BASE_URL}/api/interactions`;
    if (type === 'byApi') {
      if (!apiNameFilter.trim()) {
        toast({ title: 'Input Required', description: 'Please enter an API name to filter by.', variant: 'destructive' });
        return;
      }
      url += `/by-api/${encodeURIComponent(apiNameFilter)}`;
    } else if (type === 'byStatus') {
      if (!statusFilter.trim()) {
        toast({ title: 'Input Required', description: 'Please enter a status to filter by.', variant: 'destructive' });
        return;
      }
      url += `/by-status/${encodeURIComponent(statusFilter)}`;
    }

    setLoadingStates(prev => ({ ...prev, [type]: true }));
    setErrorMessages(prev => ({ ...prev, interactions: '' }));
    setInteractionsList([]);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      const data: ApiInteraction[] = await response.json();
      setInteractionsList(data);
      toast({ title: 'Interactions Fetched', description: `Found ${data.length} interactions.` });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching interactions';
      setErrorMessages(prev => ({ ...prev, interactions: errorMessage }));
      toast({ title: 'Failed to Fetch Interactions', description: errorMessage, variant: 'destructive' });
    } finally {
      setLoadingStates(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b shadow-sm sticky top-0 bg-card z-10">
        <h1 className="text-xl font-semibold">Sentiment Analyzer & Interaction Viewer</h1>
        <p className="text-sm text-muted-foreground">
          Connects to your Spring Boot backend at <code className="bg-muted px-1 rounded-sm">{API_BASE_URL}</code>
        </p>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 gap-4">
        {/* Sentiment Analysis Section */}
        <div className="md:w-1/2 flex flex-col gap-4">
          <h2>Sentiment Analysis</h2> {/* Added a clear heading */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><MessageSquareText className="mr-2 h-5 w-5 text-primary" />Analyze Text Sentiment</CardTitle>
              <CardDescription>Enter text to analyze its sentiment via your backend.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Organized input and button in a div */}
              <div className="flex flex-col gap-2">
                <Textarea
                  placeholder="Enter text here..."
                  value={textToAnalyze}
                  onChange={(e) => setTextToAnalyze(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
                <Button onClick={handleAnalyzeSentiment} disabled={loadingStates.analyze} className="w-full">
                  {loadingStates.analyze ? <Loader2 className="animate-spin mr-2" /> : <MessageSquareText className="mr-2 h-4 w-4" />}
                  {loadingStates.analyze ? 'Analyzing...' : 'Analyze Text'}
                </Button>
              </div>

              {errorMessages.analyze && (
                <p className="text-sm text-destructive flex items-center"><AlertCircle className="mr-1 h-4 w-4" />{errorMessages.analyze}</p>
              )}

              {analysisResult && (
                <Card className="bg-secondary/30 mt-4"> {/* Added margin top */}
                  <CardContent className="p-4 space-y-2">
                    {analysisResult.errorMessage && <p><strong>Error:</strong> {analysisResult.errorMessage}</p>}
                    {/* Display sentiment prominently */}
                    <p className={`text-lg font-semibold ${analysisResult.sentiment === 'positive' ? 'text-green-600' : analysisResult.sentiment === 'negative' ? 'text-red-600' : analysisResult.sentiment === 'neutral' ? 'text-yellow-600' : ''}`}>
                      Sentiment: {analysisResult.sentiment ? analysisResult.sentiment.charAt(0).toUpperCase() + analysisResult.sentiment.slice(1) : 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">ID: {analysisResult.id || 'N/A'}, Timestamp: {analysisResult.timestamp ? new Date(analysisResult.timestamp).toLocaleString() : 'N/A'}</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Interactions Viewer Section */}
        <section className="md:w-1/2 flex flex-col gap-4">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center"><ListFilter className="mr-2 h-5 w-5 text-primary" />View Interactions</CardTitle>
              <CardDescription>Fetch and filter API interactions from your backend.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
              <div className="space-y-2">
                <Button onClick={() => fetchInteractions('all')} disabled={loadingStates.all} className="w-full" variant="outline">
                  {loadingStates.all ? <Loader2 className="animate-spin" /> : 'Get All Interactions'}
                </Button>
                <div className="flex gap-2">
                  <Input
                    placeholder="API Name (e.g., AzureCognitive)"
                    value={apiNameFilter}
                    onChange={(e) => setApiNameFilter(e.target.value)}
                    disabled={loadingStates.byApi}
                  />
                  <Button onClick={() => fetchInteractions('byApi')} disabled={loadingStates.byApi} variant="outline" size="icon">
                    {loadingStates.byApi ? <Loader2 className="animate-spin" /> : <Search />}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Status (e.g., success)"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    disabled={loadingStates.byStatus}
                  />
                  <Button onClick={() => fetchInteractions('byStatus')} disabled={loadingStates.byStatus} variant="outline" size="icon">
                    {loadingStates.byStatus ? <Loader2 className="animate-spin" /> : <Search />}
                  </Button>
                </div>
              </div>
              
              {errorMessages.interactions && (
                <p className="text-sm text-destructive flex items-center"><AlertCircle className="mr-1 h-4 w-4" />{errorMessages.interactions}</p>
              )}

              <p className="text-sm text-muted-foreground">Found: {interactionsList.length} interaction(s)</p>
              <ScrollArea className="flex-1 rounded-md border h-64 md:h-auto">
                <div className="p-4 space-y-3">
                {interactionsList.length === 0 && !loadingStates.all && !loadingStates.byApi && !loadingStates.byStatus && !errorMessages.interactions && (
                  <p className="text-center text-muted-foreground py-4">No interactions loaded. Try fetching some.</p>
                )}
                {interactionsList.map((item) => (
                  <Card key={item.id || Math.random().toString()} className="bg-muted/20">
                    <CardHeader className="p-3">
                      <CardTitle className="text-base">{item.apiName} - {item.status}</CardTitle>
                      <CardDescription className="text-xs">
                        Sentiment: {item.sentiment || 'N/A'} | Timestamp: {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 text-xs space-y-1">
                      <p><strong>Request:</strong> <span className="break-all font-mono bg-background p-1 rounded text-[10px]">{item.requestPayload}</span></p>
                      <p><strong>Response:</strong> <span className="break-all font-mono bg-background p-1 rounded text-[10px]">{item.responsePayload}</span></p>
                      {item.errorMessage && <p><strong>Error:</strong> {item.errorMessage}</p>}
                    </CardContent>
                  </Card>
                ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

    