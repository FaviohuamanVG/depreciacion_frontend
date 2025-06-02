'use client';

import { useState, type CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { FileTree, type TreeNodeData } from '@/components/FileTree';
import { CodeEditor } from '@/components/CodeEditor';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Download, Github } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const FOLDER_STRUCTURE_DESCRIPTION = `Create a basic Angular project structure with placeholder content.
The main application code resides in /src/app.
/src/app should contain:
- core: for services (AuthService in auth.service.ts), interceptors (AuthInterceptor in auth.interceptor.ts), guards (AuthGuard in auth.guard.ts), and interfaces (User in user.model.ts).
- feature: with subdirectories for modules like 'users', 'products', and 'orders'. Each feature (e.g., users) should have basic placeholder files for a component (e.g., users.component.ts, users.component.html), service (e.g., users.service.ts), and module (e.g., users.module.ts).
- layout: for layout components, e.g., an admin layout (admin.component.ts, admin.component.html).
- shared: for reusable components (SpinnerComponent in spinner.component.ts/html, AlertComponent in alert.component.ts/html), directives (HighlightDirective in highlight.directive.ts), and utils (helpers.ts, constants.ts).
Include root files in /src: main.ts, index.html, styles.css, app.component.ts, app.component.html, app.module.ts.
Provide simple, functional placeholder content for each file, clearly indicating its purpose and type (e.g., service, component, HTML template, module). For .ts files, include basic imports and class/interface definitions. For .html files, include a simple heading related to the component.
`;

export default function CodeStructurerPage() {
  const [projectFiles, setProjectFiles] = useState<Record<string, string> | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (path: string, content: string) => {
    setSelectedFilePath(path);
    setSelectedFileContent(content);
  };

  const handleCodeChange = (path: string, newContent: string) => {
    setSelectedFileContent(newContent);
    setProjectFiles((prevFiles) => {
      if (!prevFiles) return null;
      return {
        ...prevFiles,
        [path]: newContent,
      };
    });
  };

  const handleDownloadProject = async () => {
    if (!projectFiles || Object.keys(projectFiles).length === 0) {
      toast({
        title: 'No project to download',
        description: 'Please generate a project first.',
        variant: 'destructive',
      });
      return;
    }

    const zip = new JSZip();
    for (const filePath in projectFiles) {
      zip.file(filePath, projectFiles[filePath]);
    }

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'angular-project.zip');
      toast({
        title: 'Download Started',
        description: 'Your Angular project is being downloaded.',
      });
    } catch (error) {
      console.error('Error creating ZIP file:', error);
      toast({
        title: 'Error Downloading',
        description: 'Could not create ZIP file for download.',
        variant: 'destructive',
      });
    }
  };
  
  const BrandIcon = () => (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
      <rect width="100" height="100" rx="12" fill="hsl(var(--primary))"/>
      <path d="M30 70L30 30L45 30C52.732 30 59 36.268 59 44L59 44C59 51.732 52.732 58 45 58L35 58" stroke="hsl(var(--primary-foreground))" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M50 70L70 50L50 30" stroke="hsl(var(--primary-foreground))" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );


  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-3 border-b flex items-center justify-between shadow-sm sticky top-0 bg-background z-10">
        <div className="flex items-center">
          <BrandIcon />
          <h1 className="text-xl font-headline font-semibold">Code Structurer</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleDownloadProject} 
            disabled={!projectFiles || isLoading}
            variant="default"
            size="sm"
          >
            <Download className="mr-2 h-4 w-4" />
            Download ZIP
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside 
          className="w-1/3 lg:w-1/4 border-r bg-card overflow-y-auto"
          style={{'--scrollbar-thumb': 'hsl(var(--muted))', '--scrollbar-track': 'hsl(var(--card))'} as CSSProperties }
        >
          <FileTree 
            projectFiles={projectFiles} 
            onFileSelect={handleFileSelect}
            selectedFilePath={selectedFilePath}
          />
        </aside>
        
        <main className="flex-1 p-4 bg-background overflow-y-auto">
          {!projectFiles && !isLoading && (
             <Card className="h-full flex flex-col items-center justify-center border-dashed border-2">
              <CardContent className="text-center p-8">
                <Image src="https://placehold.co/300x200.png" alt="Placeholder illustration" width={300} height={200} className="mb-6 rounded-lg shadow-md" data-ai-hint="abstract code" />
                <h2 className="text-2xl font-headline mb-2">Welcome to Code Structurer</h2>
                <p className="text-muted-foreground mb-6">
                  Generate a complete Angular project structure with a single click. <br />
                  View, edit, and download your new project's skeleton.</p>
              </CardContent>
            </Card>
          )}
          {isLoading && (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
              <p className="text-lg text-muted-foreground">Generating project structure...</p>
              <p className="text-sm text-muted-foreground">This might take a moment.</p>
            </div>
          )}
          {projectFiles && !isLoading && (
            <CodeEditor
              filePath={selectedFilePath}
              content={selectedFileContent}
              onCodeChange={handleCodeChange}
            />
          )}
        </main>
      </div>
    </div>
  );
}
