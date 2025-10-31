import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface TerminalProps {
  output: string;
  isRunning: boolean;
  onCommand: (command: string) => void;
}

export function Terminal({ output, isRunning, onCommand }: TerminalProps) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output, history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isRunning) return;

    const command = input.trim();
    setHistory([...history, `ProgramBharat-> ${command}`]);
    setInput("");
    onCommand(command);
  };

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="h-64 bg-[#0a0a0f] border-t border-purple-900/30 flex flex-col">
      <div className="h-9 bg-[#12121a] border-b border-purple-900/30 flex items-center px-4">
        <span className="text-sm text-purple-300 font-semibold">TERMINAL</span>
      </div>
      
      <div 
        ref={terminalRef}
        onClick={handleTerminalClick}
        className="flex-1 overflow-auto p-4 font-mono text-sm cursor-text"
      >
        {/* Command history */}
        {history.map((line, i) => (
          <div key={i} className="text-purple-200 mb-1">{line}</div>
        ))}
        
        {/* Output */}
        {output && (
          <div className="text-green-400 mb-2 whitespace-pre-wrap">{output}</div>
        )}

        {/* Loading state */}
        {isRunning && (
          <div className="flex items-center gap-2 text-purple-300 mb-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Executing...</span>
          </div>
        )}

        {/* Input line */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="text-purple-400 font-bold select-none">ProgramBharat-&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isRunning}
            className="flex-1 bg-transparent text-purple-200 outline-none border-none font-mono disabled:opacity-50"
            placeholder="Type 'run' to execute code, 'clear' to clear terminal, 'deploy' to deploy..."
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}
