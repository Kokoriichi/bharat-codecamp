import { Check, AlertCircle, GitBranch, Wifi, Zap } from "lucide-react";

interface StatusBarProps {
  language?: string;
  lineNumber: number;
  columnNumber: number;
  isRunning?: boolean;
}

export function StatusBar({ language, lineNumber, columnNumber, isRunning }: StatusBarProps) {
  return (
    <div className="h-6 bg-[#181818] border-t border-[#3C3C3C] flex items-center justify-between px-3 text-xs">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          {isRunning ? (
            <AlertCircle className="h-3 w-3 text-yellow-500 animate-pulse" />
          ) : (
            <Check className="h-3 w-3 text-emerald-500" />
          )}
          <span className="text-[#9C9C9C]">{isRunning ? "Running" : "Ready"}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-[#9C9C9C] hover:text-[#E0E0E0] cursor-pointer transition-colors">
          <GitBranch className="h-3 w-3" />
          <span>main</span>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-500">
          <Wifi className="h-3 w-3" />
          <span className="text-[#9C9C9C]">Connected</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-primary hover:text-primary/80 cursor-pointer transition-colors">
          <Zap className="h-3 w-3" />
          <span>AI Ready</span>
        </div>
        
        <span className="hover:bg-[#2A2A2A] px-2 py-0.5 cursor-pointer rounded transition-colors text-[#9C9C9C] hover:text-[#E0E0E0]">
          Ln {lineNumber}, Col {columnNumber}
        </span>
        <span className="hover:bg-[#2A2A2A] px-2 py-0.5 cursor-pointer rounded transition-colors text-[#9C9C9C] hover:text-[#E0E0E0]">
          {language?.toUpperCase() || "PLAINTEXT"}
        </span>
        <span className="hover:bg-[#2A2A2A] px-2 py-0.5 cursor-pointer rounded transition-colors text-[#9C9C9C] hover:text-[#E0E0E0]">
          UTF-8
        </span>
      </div>
    </div>
  );
}
