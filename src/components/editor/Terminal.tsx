import { useState, useRef, useEffect } from "react";
import { Loader2, Plus, X, ChevronDown, Split, Trash2, Terminal as TerminalIcon } from "lucide-react";

interface TerminalTab {
  id: string;
  name: string;
  history: string[];
  output: string;
  isRunning: boolean;
}

interface TerminalProps {
  output: string;
  isRunning: boolean;
  onCommand: (command: string) => void;
}

export function Terminal({ output, isRunning, onCommand }: TerminalProps) {
  const [terminals, setTerminals] = useState<TerminalTab[]>([
    { id: "1", name: "Terminal 1", history: [], output: "", isRunning: false }
  ]);
  const [activeTerminalId, setActiveTerminalId] = useState("1");
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTerminal = terminals.find(t => t.id === activeTerminalId) || terminals[0];

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [activeTerminal.output, activeTerminal.history]);

  useEffect(() => {
    setTerminals(prev => prev.map(t => 
      t.id === activeTerminalId 
        ? { ...t, output, isRunning }
        : t
    ));
  }, [output, isRunning, activeTerminalId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || "");
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      // Auto-complete logic could go here
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isRunning) return;

    const command = input.trim();
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    
    setTerminals(prev => prev.map(t =>
      t.id === activeTerminalId
        ? { ...t, history: [...t.history, `ProgramBharat-> ${command}`] }
        : t
    ));
    
    setInput("");
    onCommand(command);
  };

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const addNewTerminal = () => {
    const newId = Date.now().toString();
    setTerminals([...terminals, {
      id: newId,
      name: `Terminal ${terminals.length + 1}`,
      history: [],
      output: "",
      isRunning: false
    }]);
    setActiveTerminalId(newId);
  };

  const closeTerminal = (id: string) => {
    if (terminals.length === 1) return;
    const filtered = terminals.filter(t => t.id !== id);
    setTerminals(filtered);
    if (activeTerminalId === id) {
      setActiveTerminalId(filtered[0].id);
    }
  };

  const splitTerminal = () => {
    const newId = Date.now().toString();
    setTerminals([...terminals, {
      id: newId,
      name: `Terminal ${terminals.length + 1}`,
      history: [],
      output: "",
      isRunning: false
    }]);
    setActiveTerminalId(newId);
  };

  const clearTerminal = () => {
    setTerminals(prev => prev.map(t =>
      t.id === activeTerminalId
        ? { ...t, history: [], output: "" }
        : t
    ));
  };

  return (
    <div className="h-64 bg-[#0a0a0f] border-t border-purple-900/30 flex flex-col">
      {/* Terminal Header with Tabs */}
      <div className="h-9 bg-[#12121a] border-b border-purple-900/30 flex items-center justify-between">
        <div className="flex items-center flex-1 overflow-x-auto">
          {terminals.map((terminal) => (
            <div
              key={terminal.id}
              onClick={() => setActiveTerminalId(terminal.id)}
              className={`h-full flex items-center gap-2 px-3 border-r border-purple-900/20 cursor-pointer group ${
                activeTerminalId === terminal.id
                  ? "bg-[#0a0a0f] text-purple-300"
                  : "text-purple-400/60 hover:text-purple-300 hover:bg-[#0a0a0f]/50"
              }`}
            >
              <TerminalIcon className="h-3 w-3" />
              <span className="text-xs font-medium">{terminal.name}</span>
              {terminals.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTerminal(terminal.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        
        {/* Terminal Controls */}
        <div className="flex items-center gap-1 px-2">
          <button
            onClick={addNewTerminal}
            className="p-1 hover:bg-purple-900/20 rounded text-purple-400 hover:text-purple-300"
            title="New Terminal"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={splitTerminal}
            className="p-1 hover:bg-purple-900/20 rounded text-purple-400 hover:text-purple-300"
            title="Split Terminal"
          >
            <Split className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={clearTerminal}
            className="p-1 hover:bg-purple-900/20 rounded text-purple-400 hover:text-purple-300"
            title="Clear Terminal"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button className="p-1 hover:bg-purple-900/20 rounded text-purple-400 hover:text-purple-300">
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      
      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        onClick={handleTerminalClick}
        className="flex-1 overflow-auto p-4 font-mono text-sm cursor-text"
      >
        {/* Command history */}
        {activeTerminal.history.map((line, i) => (
          <div key={i} className="text-purple-200 mb-1">{line}</div>
        ))}
        
        {/* Output */}
        {activeTerminal.output && (
          <div className="text-green-400 mb-2 whitespace-pre-wrap font-mono">{activeTerminal.output}</div>
        )}

        {/* Loading state */}
        {activeTerminal.isRunning && (
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
            onKeyDown={handleKeyDown}
            disabled={isRunning}
            className="flex-1 bg-transparent text-purple-200 outline-none border-none font-mono disabled:opacity-50"
            placeholder="Type 'run' to execute, 'clear' to clear, 'deploy' to deploy, 'help' for commands..."
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}
