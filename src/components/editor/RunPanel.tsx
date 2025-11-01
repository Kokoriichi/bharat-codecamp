import { Play, Bug, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RunPanelProps {
  onRun: () => void;
  isRunning: boolean;
}

export function RunPanel({ onRun, isRunning }: RunPanelProps) {
  return (
    <div className="w-64 bg-[#1E1E1E] border-r border-[#3C3C3C] flex flex-col">
      <div className="p-3 border-b border-[#3C3C3C]">
        <div className="text-xs font-semibold text-[#E0E0E0] mb-3 uppercase">Run and Debug</div>
        
        <Button
          onClick={onRun}
          disabled={isRunning}
          className="w-full h-9 bg-primary hover:bg-primary/90"
        >
          <Play className="h-4 w-4 mr-2" />
          Run Code
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#9C9C9C] uppercase">Configurations</span>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Settings className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 p-2 hover:bg-[#2A2A2A] rounded cursor-pointer">
              <Play className="h-3 w-3 text-primary" />
              <span className="text-xs text-[#E0E0E0]">Run File</span>
            </div>
            <div className="flex items-center gap-2 p-2 hover:bg-[#2A2A2A] rounded cursor-pointer">
              <Bug className="h-3 w-3 text-primary" />
              <span className="text-xs text-[#E0E0E0]">Debug File</span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2 cursor-pointer">
            <ChevronDown className="h-3 w-3 text-[#9C9C9C]" />
            <span className="text-xs text-[#9C9C9C] uppercase">Breakpoints</span>
          </div>
          <div className="text-xs text-[#9C9C9C] ml-5">No breakpoints</div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2 cursor-pointer">
            <ChevronDown className="h-3 w-3 text-[#9C9C9C]" />
            <span className="text-xs text-[#9C9C9C] uppercase">Watch</span>
          </div>
          <div className="text-xs text-[#9C9C9C] ml-5">No watch expressions</div>
        </div>
      </div>
    </div>
  );
}
