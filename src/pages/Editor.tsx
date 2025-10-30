import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const languageOptions = [
  { value: "python", label: "Python", default: "# Write your Python code here\nprint('Hello, Bharat!')" },
  { value: "javascript", label: "JavaScript", default: "// Write your JavaScript code here\nconsole.log('Hello, Bharat!');" },
  { value: "cpp", label: "C++", default: "// Write your C++ code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello, Bharat!\" << endl;\n    return 0;\n}" },
  { value: "java", label: "Java", default: "// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, Bharat!\");\n    }\n}" },
];

export default function EditorPage() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(languageOptions[0].default);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const handleLanguageChange = (newLang: string) => {
    const langOption = languageOptions.find((l) => l.value === newLang);
    if (langOption) {
      setLanguage(newLang);
      setCode(langOption.default);
      setOutput("");
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("Running code...");

    try {
      const { data, error } = await supabase.functions.invoke("execute-code", {
        body: { code, language },
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

  const saveCode = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save code",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("user_codes").insert({
      user_id: user.id,
      title: `${language} code - ${new Date().toLocaleDateString()}`,
      code,
      language,
    });

    if (error) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Code saved! 💾",
        description: "Your code has been saved successfully",
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6 gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Code Editor</h1>
        <div className="flex items-center gap-4">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={saveCode} variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button onClick={runCode} disabled={isRunning}>
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
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </Card>

        <Card className="p-4 bg-terminal-bg border-border overflow-auto">
          <div className="text-sm font-mono">
            <div className="text-muted-foreground mb-2">Output:</div>
            <pre className="text-foreground whitespace-pre-wrap">{output || "Run your code to see output here..."}</pre>
          </div>
        </Card>
      </div>
    </div>
  );
}
