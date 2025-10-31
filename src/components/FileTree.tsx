import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: FileNode[];
}

interface FileTreeProps {
  files: FileNode[];
  selectedFileId: string | null;
  onFileSelect: (file: FileNode) => void;
  onCreateFile: (parentId: string | null, name: string, language: string) => void;
  onCreateFolder: (parentId: string | null, name: string) => void;
  onDeleteNode: (id: string) => void;
}

export function FileTree({ 
  files, 
  selectedFileId, 
  onFileSelect, 
  onCreateFile, 
  onCreateFolder,
  onDeleteNode 
}: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [creatingIn, setCreatingIn] = useState<string | null>(null);
  const [creatingType, setCreatingType] = useState<"file" | "folder" | null>(null);
  const [newName, setNewName] = useState("");

  const toggleFolder = (id: string) => {
    const next = new Set(expandedFolders);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedFolders(next);
  };

  const startCreating = (parentId: string | null, type: "file" | "folder") => {
    setCreatingIn(parentId);
    setCreatingType(type);
    setNewName("");
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    
    if (creatingType === "file") {
      const ext = newName.split(".").pop()?.toLowerCase();
      const langMap: Record<string, string> = {
        py: "python", js: "javascript", cpp: "cpp", java: "java",
        c: "c", cs: "csharp", rb: "ruby", go: "go", rs: "rust",
        php: "php", swift: "swift", kt: "kotlin", ts: "typescript",
        html: "html", css: "css", json: "json"
      };
      const language = langMap[ext || ""] || "python";
      onCreateFile(creatingIn, newName, language);
    } else {
      onCreateFolder(creatingIn, newName);
    }
    
    setCreatingIn(null);
    setCreatingType(null);
    setNewName("");
  };

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = node.id === selectedFileId;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-1 px-2 py-1 hover:bg-accent cursor-pointer ${
            isSelected ? "bg-accent" : ""
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {node.type === "folder" ? (
            <>
              <button onClick={() => toggleFolder(node.id)} className="p-0 h-4 w-4">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
              <span className="flex-1 text-sm" onClick={() => toggleFolder(node.id)}>{node.name}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  startCreating(node.id, "file");
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNode(node.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
              <File className="h-4 w-4 ml-4" />
              <span className="flex-1 text-sm" onClick={() => onFileSelect(node)}>{node.name}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNode(node.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>

        {node.type === "folder" && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderNode(child, depth + 1))}
            {creatingIn === node.id && (
              <div className="flex items-center gap-1 px-2 py-1" style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                    if (e.key === "Escape") {
                      setCreatingIn(null);
                      setCreatingType(null);
                    }
                  }}
                  placeholder={creatingType === "file" ? "filename.ext" : "folder-name"}
                  className="h-6 text-sm"
                  autoFocus
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      <div className="p-2 border-b border-border flex items-center justify-between">
        <span className="text-sm font-semibold">Explorer</span>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => startCreating(null, "file")}
            title="New File"
          >
            <File className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => startCreating(null, "folder")}
            title="New Folder"
          >
            <Folder className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {files.map((node) => renderNode(node))}
        {creatingIn === null && (
          creatingType && (
            <div className="flex items-center gap-1 px-2 py-1">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") {
                    setCreatingIn(null);
                    setCreatingType(null);
                  }
                }}
                placeholder={creatingType === "file" ? "filename.ext" : "folder-name"}
                className="h-6 text-sm"
                autoFocus
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}
