import { useState } from "react";
import { Sparkles, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InlineAIChatProps {
  onClose: () => void;
  onInsertCode: (code: string) => void;
  currentCode?: string;
  language?: string;
}

export function InlineAIChat({ onClose, onInsertCode, currentCode, language }: InlineAIChatProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const context = currentCode ? `Current code:\n\`\`\`${language}\n${currentCode}\n\`\`\`\n\n` : "";
      const fullPrompt = `${context}${prompt}\n\nProvide only the code without explanation. Use ${language} language.`;

      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          messages: [
            { role: "system", content: "You are a code generation assistant. Return only code without markdown formatting or explanations." },
            { role: "user", content: fullPrompt }
          ]
        }
      });

      if (error) throw error;

      const code = data.response?.replace(/```[\w]*\n?|```/g, "").trim() || "";
      onInsertCode(code);
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-50 bg-[#1E1E1E] border-b border-primary shadow-lg shadow-primary/20 animate-in slide-in-from-top duration-200">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-[#E0E0E0]">AI Code Generation</span>
          </div>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>

        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey) {
              handleGenerate();
            }
          }}
          placeholder="Describe what you want to generate... (⌘+Enter to generate)"
          className="bg-[#252526] border-[#3C3C3C] text-[#E0E0E0] min-h-[80px] resize-none"
          autoFocus
        />

        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={!prompt.trim() || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="h-3 w-3 mr-2" />
                Generate Code
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
