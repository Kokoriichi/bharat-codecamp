import { useState, useEffect } from "react";
import { Command, Search, FileCode, Play, Save, Settings, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommand: (command: string) => void;
}

interface CommandItem {
  id: string;
  label: string;
  icon: any;
  shortcut?: string;
  category: string;
}

export function CommandPalette({ open, onOpenChange, onCommand }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(0);

  const commands: CommandItem[] = [
    { id: "run", label: "Run Code", icon: Play, shortcut: "Ctrl+R", category: "Actions" },
    { id: "save", label: "Save Project", icon: Save, shortcut: "Ctrl+S", category: "Actions" },
    { id: "ai", label: "Ask AI Assistant", icon: Sparkles, shortcut: "Ctrl+K", category: "AI" },
    { id: "search", label: "Search Files", icon: Search, shortcut: "Ctrl+P", category: "Navigation" },
    { id: "new-file", label: "New File", icon: FileCode, shortcut: "Ctrl+N", category: "File" },
    { id: "settings", label: "Settings", icon: Settings, category: "Settings" },
  ];

  const filtered = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setSelected(0);
  }, [search]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelected(0);
    }
  }, [open]);

  const handleSelect = (cmdId: string) => {
    onCommand(cmdId);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => (s + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => (s - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selected]) {
        handleSelect(filtered[selected].id);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-2xl bg-[#1E1E1E] border-[#3C3C3C]">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#3C3C3C]">
          <Command className="h-4 w-4 text-primary" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="border-0 bg-transparent focus-visible:ring-0 text-[#E0E0E0] placeholder:text-[#9C9C9C]"
            autoFocus
          />
        </div>

        <ScrollArea className="max-h-[400px]">
          <div className="p-2">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-[#9C9C9C] text-sm">
                No commands found
              </div>
            ) : (
              <div className="space-y-1">
                {filtered.map((cmd, idx) => (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                      idx === selected
                        ? "bg-primary/20 text-primary"
                        : "hover:bg-[#2A2A2A] text-[#E0E0E0]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <cmd.icon className="h-4 w-4" />
                      <div className="text-left">
                        <div className="text-sm font-medium">{cmd.label}</div>
                        <div className="text-xs text-[#9C9C9C]">{cmd.category}</div>
                      </div>
                    </div>
                    {cmd.shortcut && (
                      <div className="text-xs text-[#9C9C9C] bg-[#252526] px-2 py-1 rounded">
                        {cmd.shortcut}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
