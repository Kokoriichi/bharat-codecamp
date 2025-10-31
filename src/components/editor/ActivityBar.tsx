import { Files, Search, GitBranch, Play, Settings } from "lucide-react";

interface ActivityBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
  const items = [
    { id: "explorer", icon: Files, label: "Explorer" },
    { id: "search", icon: Search, label: "Search" },
    { id: "git", icon: GitBranch, label: "Source Control" },
    { id: "run", icon: Play, label: "Run and Debug" },
  ];

  return (
    <div className="w-12 bg-[#181818] border-r border-[#3C3C3C] flex flex-col items-center py-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id)}
          className={`w-full h-12 flex items-center justify-center hover:bg-[#2A2A2A] relative ${
            activeView === item.id ? "text-primary" : "text-[#9C9C9C]"
          }`}
          title={item.label}
        >
          <item.icon className="h-6 w-6" />
          {activeView === item.id && (
            <div className="absolute left-0 w-0.5 h-full bg-primary" />
          )}
        </button>
      ))}
      
      <div className="flex-1" />
      
      <button
        className="w-full h-12 flex items-center justify-center hover:bg-[#2A2A2A] text-[#9C9C9C]"
        title="Settings"
      >
        <Settings className="h-6 w-6" />
      </button>
    </div>
  );
}
