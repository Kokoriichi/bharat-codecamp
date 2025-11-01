import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileTree, FileNode } from "@/components/FileTree";
import { projectSchema } from "@/lib/validations";
import { ActivityBar } from "@/components/editor/ActivityBar";
import { TabBar } from "@/components/editor/TabBar";
import { StatusBar } from "@/components/editor/StatusBar";
import { VSCodeEditor } from "@/components/editor/VSCodeEditor";
import { Terminal } from "@/components/editor/Terminal";
import { SearchPanel } from "@/components/editor/SearchPanel";
import { GitPanel } from "@/components/editor/GitPanel";
import { RunPanel } from "@/components/editor/RunPanel";
import { AIAssistant } from "@/components/editor/AIAssistant";
import { CommandPalette } from "@/components/editor/CommandPalette";
import { Breadcrumb } from "@/components/editor/Breadcrumb";
import { InlineAIChat } from "@/components/editor/InlineAIChat";

const defaultFiles: FileNode[] = [
  {
    id: "1",
    name: "main.py",
    type: "file",
    language: "python",
    content: "# Write your Python code here\nprint('Hello, World!')",
  },
];

export default function EditorPage() {
  const [files, setFiles] = useState<FileNode[]>(defaultFiles);
  const [openFiles, setOpenFiles] = useState<FileNode[]>([defaultFiles[0]]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(defaultFiles[0]);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [activeView, setActiveView] = useState("explorer");
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showInlineAI, setShowInlineAI] = useState(false);
  const { toast } = useToast();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "i") {
        e.preventDefault();
        setShowInlineAI(!showInlineAI);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveProject();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "r") {
        e.preventDefault();
        runCode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showInlineAI]);

  const findNodeById = (nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const updateNodeContent = (nodes: FileNode[], id: string, content: string): FileNode[] => {
    return nodes.map((node) => {
      if (node.id === id) {
        return { ...node, content };
      }
      if (node.children) {
        return { ...node, children: updateNodeContent(node.children, id, content) };
      }
      return node;
    });
  };

  const deleteNode = (nodes: FileNode[], id: string): FileNode[] => {
    return nodes.filter((node) => {
      if (node.id === id) return false;
      if (node.children) {
        node.children = deleteNode(node.children, id);
      }
      return true;
    });
  };

  const addNode = (
    nodes: FileNode[],
    parentId: string | null,
    newNode: FileNode
  ): FileNode[] => {
    if (parentId === null) {
      return [...nodes, newNode];
    }
    return nodes.map((node) => {
      if (node.id === parentId && node.type === "folder") {
        return {
          ...node,
          children: [...(node.children || []), newNode],
        };
      }
      if (node.children) {
        return {
          ...node,
          children: addNode(node.children, parentId, newNode),
        };
      }
      return node;
    });
  };

  const handleCodeChange = (value: string | undefined) => {
    if (!selectedFile || selectedFile.type !== "file") return;
    const updated = updateNodeContent(files, selectedFile.id, value || "");
    setFiles(updated);
    const updatedFile = findNodeById(updated, selectedFile.id);
    if (updatedFile) setSelectedFile(updatedFile);
  };

  const handleFileSelect = (file: FileNode) => {
    setSelectedFile(file);
    if (!openFiles.find(f => f.id === file.id)) {
      setOpenFiles([...openFiles, file]);
    }
  };

  const handleCloseFile = (id: string) => {
    const updated = openFiles.filter(f => f.id !== id);
    setOpenFiles(updated);
    if (selectedFile?.id === id) {
      setSelectedFile(updated[updated.length - 1] || null);
    }
  };

  const handleCreateFile = (parentId: string | null, name: string, language: string) => {
    const newFile: FileNode = {
      id: Date.now().toString(),
      name,
      type: "file",
      language,
      content: `// ${name}\n`,
    };
    const updated = addNode(files, parentId, newFile);
    setFiles(updated);
    setSelectedFile(newFile);
    setOpenFiles([...openFiles, newFile]);
  };

  const handleCreateFolder = (parentId: string | null, name: string) => {
    const newFolder: FileNode = {
      id: Date.now().toString(),
      name,
      type: "folder",
      children: [],
    };
    setFiles(addNode(files, parentId, newFolder));
  };

  const handleDeleteNode = (id: string) => {
    const updated = deleteNode(files, id);
    setFiles(updated);
    setOpenFiles(openFiles.filter(f => f.id !== id));
    if (selectedFile?.id === id) {
      const remaining = openFiles.filter(f => f.id !== id);
      setSelectedFile(remaining[remaining.length - 1] || updated.find((f) => f.type === "file") || null);
    }
  };

  const runCode = async () => {
    if (!selectedFile || selectedFile.type !== "file" || !selectedFile.content) {
      toast({
        title: "No file selected",
        description: "Please select a file to run",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setOutput("Running code...\n");

    try {
      const { data, error } = await supabase.functions.invoke("execute-code", {
        body: { code: selectedFile.content, language: selectedFile.language },
      });

      if (error) throw error;

      setOutput(data.output || data.error || "No output");
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
      toast({
        title: "Execution failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleTerminalCommand = async (command: string) => {
    const cmd = command.toLowerCase().trim();
    
    if (cmd === "run") {
      await runCode();
    } else if (cmd === "clear") {
      setOutput("");
    } else if (cmd === "deploy") {
      setOutput("Deploying application...\nBuilding project...\nDeployment successful! 🚀");
    } else if (cmd === "help") {
      setOutput("Available commands:\n  run    - Execute the current file\n  clear  - Clear terminal\n  deploy - Deploy the application\n  help   - Show this help message");
    } else {
      setOutput(`Command not found: ${command}\nType 'help' for available commands`);
    }
  };

  const handleCommandPalette = (commandId: string) => {
    switch (commandId) {
      case "run":
        runCode();
        break;
      case "save":
        saveProject();
        break;
      case "ai":
        setActiveView("ai");
        break;
      case "search":
        setActiveView("search");
        break;
      case "new-file":
        handleCreateFile(null, "untitled.txt", "plaintext");
        break;
      default:
        toast({
          title: "Command",
          description: `Executed: ${commandId}`,
        });
    }
  };

  const saveProject = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to save projects",
          variant: "destructive",
        });
        return;
      }

      const projectData = JSON.stringify(files);
      const title = `Project - ${new Date().toLocaleDateString()}`;

      // Validate project data
      projectSchema.parse({
        title,
        code: projectData,
      });

      const { error } = await supabase.from("user_codes").insert({
        user_id: user.id,
        title: title.substring(0, 100),
        code: projectData.substring(0, 100000),
        language: "project",
      });

      if (error) throw error;

      toast({
        title: "Project saved! 💾",
        description: "Your project has been saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.errors?.[0]?.message || error.message || "Please check your inputs",
        variant: "destructive",
      });
    }
  };

  const breadcrumbPath = selectedFile?.name ? ["workspace", selectedFile.name] : ["workspace"];

  return (
    <div className="flex h-screen bg-[#1E1E1E] overflow-hidden">
      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        onCommand={handleCommandPalette}
      />
      {/* Activity Bar */}
      <ActivityBar activeView={activeView} onViewChange={setActiveView} />

      {/* Sidebar */}
      {activeView === "explorer" && (
        <div className="w-64 border-r border-[#3C3C3C]">
          <FileTree
            files={files}
            selectedFileId={selectedFile?.id || null}
            onFileSelect={handleFileSelect}
            onCreateFile={handleCreateFile}
            onCreateFolder={handleCreateFolder}
            onDeleteNode={handleDeleteNode}
          />
        </div>
      )}

      {activeView === "search" && (
        <SearchPanel onSearch={(query, options) => {
          toast({
            title: "Search",
            description: `Searching for: ${query}`,
          });
        }} />
      )}

      {activeView === "git" && <GitPanel />}

      {activeView === "run" && (
        <RunPanel onRun={runCode} isRunning={isRunning} />
      )}

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Toolbar */}
        <div className="h-9 bg-[#252526] border-b border-[#3C3C3C] flex items-center justify-between px-4">
          <div className="text-sm text-[#E0E0E0]">
            {selectedFile?.name || "No file open"}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={saveProject} 
              size="sm"
              variant="ghost"
              className="h-7 text-xs hover:bg-[#2A2A2A]"
            >
              <Save className="mr-1 h-3 w-3" />
              Save
            </Button>
            <Button 
              onClick={runCode} 
              disabled={isRunning || !selectedFile || selectedFile.type !== "file"}
              size="sm"
              className="h-7 text-xs bg-primary hover:bg-primary/90"
            >
              {isRunning ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Play className="mr-1 h-3 w-3" />
              )}
              Run
            </Button>
          </div>
        </div>

        {/* Tab Bar */}
        <TabBar
          openFiles={openFiles}
          activeFileId={selectedFile?.id || null}
          onSelectFile={handleFileSelect}
          onCloseFile={handleCloseFile}
        />

        {/* Breadcrumb */}
        <Breadcrumb path={breadcrumbPath} />

        {/* Editor */}
        <div className="flex-1 overflow-hidden relative">
          {showInlineAI && (
            <InlineAIChat
              onClose={() => setShowInlineAI(false)}
              onInsertCode={(code) => {
                if (selectedFile) {
                  handleCodeChange(code);
                }
              }}
              currentCode={selectedFile?.content}
              language={selectedFile?.language}
            />
          )}
          
          {selectedFile?.type === "file" ? (
            <VSCodeEditor
              value={selectedFile.content || ""}
              language={selectedFile.language || "plaintext"}
              onChange={handleCodeChange}
              onCursorChange={(line, column) => setCursorPosition({ line, column })}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-[#9C9C9C] bg-[#1E1E1E]">
              <div className="text-center">
                <div className="text-6xl mb-4">👨‍💻</div>
                <div className="text-xl mb-2">No file selected</div>
                <div className="text-sm">Open a file from the Explorer to start coding</div>
              </div>
            </div>
          )}
        </div>

        {/* Terminal Panel */}
        <Terminal 
          output={output}
          isRunning={isRunning}
          onCommand={handleTerminalCommand}
        />

          {/* Status Bar */}
          <StatusBar
            language={selectedFile?.language}
            lineNumber={cursorPosition.line}
            columnNumber={cursorPosition.column}
            isRunning={isRunning}
          />
        </div>

        {/* AI Assistant */}
        {activeView === "ai" && (
          <div className="w-96">
            <AIAssistant
              currentCode={selectedFile?.content}
              language={selectedFile?.language}
            />
          </div>
        )}
      </div>
    </div>
  );
}
