// @ts-nocheck
'use client';

import type React from 'react';
import { useState } from 'react';
import { Folder, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface FileNodeData {
  name: string;
  type: 'file';
  content: string;
  path: string;
}

export interface FolderNodeData {
  name: string;
  type: 'folder';
  path: string;
  children: Record<string, TreeNodeData>;
}

export type TreeNodeData = FileNodeData | FolderNodeData;

interface FileTreeItemProps {
  name: string;
  node: TreeNodeData;
  onFileSelect: (path: string, content: string) => void;
  level: number;
  selectedFilePath: string | null;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ name, node, onFileSelect, level, selectedFilePath }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleToggle = () => {
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = () => {
    if (node.type === 'file') {
      onFileSelect(node.path, node.content);
    } else {
      handleToggle();
    }
  };

  const indent = level * 20; // 20px per level

  return (
    <div>
      <div
        className={cn(
          "flex items-center p-1.5 rounded-md hover:bg-accent/50 cursor-pointer",
          node.type === 'file' && selectedFilePath === node.path && "bg-accent text-accent-foreground hover:bg-accent",
          node.type === 'folder' && "font-medium"
        )}
        style={{ paddingLeft: `${indent + 8}px` }}
        onClick={handleSelect}
        onKeyDown={(e) => e.key === 'Enter' && handleSelect()}
        role="button"
        tabIndex={0}
      >
        {node.type === 'folder' ? (
          isOpen ? <ChevronDown size={18} className="mr-2 shrink-0" /> : <ChevronRight size={18} className="mr-2 shrink-0" />
        ) : (
          <div style={{ width: '18px' }} className="mr-2 shrink-0"></div> 
        )}
        {node.type === 'folder' ? (
          <Folder size={18} className="mr-2 text-primary shrink-0" />
        ) : (
          <FileText size={18} className="mr-2 text-muted-foreground shrink-0" />
        )}
        <span className="truncate text-sm">{name}</span>
      </div>
      {node.type === 'folder' && isOpen && (
        <div>
          {Object.entries(node.children)
            .sort(([nameA, nodeA], [nameB, nodeB]) => {
              if (nodeA.type === 'folder' && nodeB.type === 'file') return -1;
              if (nodeA.type === 'file' && nodeB.type === 'folder') return 1;
              return nameA.localeCompare(nameB);
            })
            .map(([childName, childNode]) => (
            <FileTreeItem
              key={childName}
              name={childName}
              node={childNode}
              onFileSelect={onFileSelect}
              level={level + 1}
              selectedFilePath={selectedFilePath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface FileTreeProps {
  projectFiles: Record<string, string> | null;
  onFileSelect: (path: string, content: string) => void;
  selectedFilePath: string | null;
}

export const buildFileTree = (projectFiles: Record<string, string>): Record<string, TreeNodeData> => {
  const root: Record<string, TreeNodeData> = {};

  const sortedPaths = Object.keys(projectFiles).sort();

  for (const path of sortedPaths) {
    const parts = path.split('/').filter(p => p);
    let currentLevel = root;
    let currentPath = '';

    parts.forEach((part, index) => {
      currentPath += (currentPath ? '/' : '') + part;
      if (index === parts.length - 1) { 
        currentLevel[part] = {
          name: part,
          type: 'file',
          content: projectFiles[path],
          path: path,
        };
      } else { 
        if (!currentLevel[part]) {
          currentLevel[part] = {
            name: part,
            type: 'folder',
            path: currentPath,
            children: {},
          };
        } else if (currentLevel[part].type === 'file') {
          // This handles cases where a file might have the same name as a directory path segment
          // For example, if "src" is a file and "src/app" is a folder.
          // The generator should avoid this, but this makes it robust.
          // Convert to folder and preserve content if necessary, or log warning
           currentLevel[part] = {
            name: part,
            type: 'folder',
            path: currentPath,
            children: {},
          };
        }
        currentLevel = (currentLevel[part] as FolderNodeData).children;
      }
    });
  }
  return root;
};


export const FileTree: React.FC<FileTreeProps> = ({ projectFiles, onFileSelect, selectedFilePath }) => {
  if (!projectFiles || Object.keys(projectFiles).length === 0) {
    return <div className="p-4 text-sm text-muted-foreground">Generate a project to see the file tree.</div>;
  }

  const treeData = buildFileTree(projectFiles);

  return (
    <ScrollArea className="h-full">
      <div className="p-2">
        {Object.entries(treeData)
          .sort(([nameA, nodeA], [nameB, nodeB]) => {
              if (nodeA.type === 'folder' && nodeB.type === 'file') return -1;
              if (nodeA.type === 'file' && nodeB.type === 'folder') return 1;
              return nameA.localeCompare(nameB);
          })
          .map(([name, node]) => (
          <FileTreeItem
            key={name}
            name={name}
            node={node}
            onFileSelect={onFileSelect}
            level={0}
            selectedFilePath={selectedFilePath}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
