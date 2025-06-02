// @ts-nocheck
'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CodeEditorProps {
  filePath: string | null;
  content: string | null;
  onCodeChange: (path: string, newContent: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ filePath, content, onCodeChange }) => {
  const [currentContent, setCurrentContent] = useState(content || '');

  useEffect(() => {
    setCurrentContent(content || '');
  }, [content, filePath]);

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentContent(event.target.value);
    if (filePath) {
      onCodeChange(filePath, event.target.value);
    }
  };

  if (!filePath || content === null) {
    return (
      <Card className="h-full flex flex-col items-center justify-center">
        <CardContent className="text-center">
          <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Select a file to view or edit its content.</p>
        </CardContent>
      </Card>
    );
  }
  
  // A simple SVG icon for FileText if lucide-react is not imported here.
  const FileText = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );


  return (
    <Card className="h-full flex flex-col shadow-lg rounded-lg">
      <CardHeader className="border-b">
        <CardTitle className="font-code text-base truncate">{filePath}</CardTitle>
        <CardDescription>Edit the content of the selected file.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <Textarea
            value={currentContent}
            onChange={handleContentChange}
            className="font-code h-full w-full resize-none border-0 rounded-none focus-visible:ring-0 p-4 text-sm"
            placeholder="File content will appear here..."
            aria-label={`Code editor for ${filePath}`}
          />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
