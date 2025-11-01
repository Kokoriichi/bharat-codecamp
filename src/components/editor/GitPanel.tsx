import { GitBranch, GitCommit, GitPullRequest, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function GitPanel() {
  const [commitMessage, setCommitMessage] = useState("");

  return (
    <div className="w-64 bg-[#1E1E1E] border-r border-[#3C3C3C] flex flex-col">
      <div className="p-3 border-b border-[#3C3C3C]">
        <div className="text-xs font-semibold text-[#E0E0E0] mb-3 uppercase">Source Control</div>
        
        <div className="space-y-2">
          <Input
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Message (Ctrl+Enter to commit)"
            className="bg-[#252526] border-[#3C3C3C] text-[#E0E0E0] text-sm"
          />
          <Button
            className="w-full h-8 text-xs bg-primary hover:bg-primary/90"
            disabled={!commitMessage}
          >
            <GitCommit className="h-3 w-3 mr-1" />
            Commit
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-3 border-b border-[#3C3C3C]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#9C9C9C] uppercase">Changes</span>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-xs text-[#9C9C9C]">No changes</div>
        </div>

        <div className="p-3 space-y-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#E0E0E0] mb-2">
              <GitBranch className="h-3 w-3" />
              <span>main</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs text-[#9C9C9C] mb-2">
              <GitPullRequest className="h-3 w-3" />
              <span>No pull requests</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
