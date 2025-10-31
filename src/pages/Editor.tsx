import { useState } from "react";
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
  const { toast } = useToast();

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
    setOutput("Running code...");

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

  return (
    <div className="flex h-screen bg-[#1E1E1E] overflow-hidden">
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

      {/* Main Editor Area */}
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

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
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

        {/* Terminal/Output Panel */}
        <div className="h-64 bg-[#141414] border-t border-[#3C3C3C] flex flex-col">
          <div className="h-9 bg-[#1E1E1E] border-b border-[#3C3C3C] flex items-center px-4">
            <span className="text-sm text-[#E0E0E0]">OUTPUT</span>
          </div>
          <div className="flex-1 overflow-auto p-4 font-mono text-sm text-[#E0E0E0]">
            {output ? (
              <pre className="whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="text-[#9C9C9C]">
                Run your code to see output here...
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <StatusBar
          language={selectedFile?.language}
          lineNumber={cursorPosition.line}
          columnNumber={cursorPosition.column}
          isRunning={isRunning}
        />
      </div>
    </div>
  );
}
