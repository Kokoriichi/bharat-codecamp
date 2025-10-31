import { Check, AlertCircle, Info } from "lucide-react";

interface StatusBarProps {
  language?: string;
  lineNumber: number;
  columnNumber: number;
  isRunning?: boolean;
}

export function StatusBar({ language, lineNumber, columnNumber, isRunning }: StatusBarProps) {
  return (
    <div className="h-6 bg-[#1E1E1E] border-t border-[#3C3C3C] flex items-center justify-between px-4 text-xs text-[#E0E0E0]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {isRunning ? (
            <AlertCircle className="h-3 w-3 text-yellow-500" />
          ) : (
            <Check className="h-3 w-3 text-green-500" />
          )}
          <span>{isRunning ? "Running..." : "Ready"}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="hover:bg-[#2A2A2A] px-2 py-1 cursor-pointer rounded">
          Ln {lineNumber}, Col {columnNumber}
        </span>
        <span className="hover:bg-[#2A2A2A] px-2 py-1 cursor-pointer rounded">
          {language?.toUpperCase() || "PLAINTEXT"}
        </span>
        <span className="hover:bg-[#2A2A2A] px-2 py-1 cursor-pointer rounded">
          UTF-8
        </span>
        <span className="hover:bg-[#2A2A2A] px-2 py-1 cursor-pointer rounded">
          LF
        </span>
      </div>
    </div>
  );
}
