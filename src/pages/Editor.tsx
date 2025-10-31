import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileTree, FileNode } from "@/components/FileTree";
import { projectSchema } from "@/lib/validations";

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
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(defaultFiles[0]);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
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
    if (selectedFile?.id === id) {
      setSelectedFile(updated.find((f) => f.type === "file") || null);
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
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-64">
        <FileTree
          files={files}
          selectedFileId={selectedFile?.id || null}
          onFileSelect={setSelectedFile}
          onCreateFile={handleCreateFile}
          onCreateFolder={handleCreateFolder}
          onDeleteNode={handleDeleteNode}
        />
      </div>

      <div className="flex-1 flex flex-col p-6 gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {selectedFile?.type === "file" ? selectedFile.name : "Code Editor"}
          </h1>
          <div className="flex items-center gap-4">
            <Button onClick={saveProject} variant="outline">
              <Save className="mr-2 h-4 w-4" />
              Save Project
            </Button>
            <Button onClick={runCode} disabled={isRunning || !selectedFile || selectedFile.type !== "file"}>
              {isRunning ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Run Code
            </Button>
          </div>
        </div>

        <div className="flex-1 grid grid-rows-2 gap-4">
          <Card className="overflow-hidden border-border">
            {selectedFile?.type === "file" ? (
              <Editor
                height="100%"
                language={selectedFile.language}
                value={selectedFile.content || ""}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a file to start coding
              </div>
            )}
          </Card>

          <Card className="p-4 bg-terminal-bg border-border overflow-auto">
            <div className="text-sm font-mono">
              <div className="text-muted-foreground mb-2">Output:</div>
              <pre className="text-foreground whitespace-pre-wrap">
                {output || "Run your code to see output here..."}
              </pre>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
