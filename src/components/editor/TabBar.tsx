import { X, FileCode } from "lucide-react";
import { FileNode } from "@/components/FileTree";

interface TabBarProps {
  openFiles: FileNode[];
  activeFileId: string | null;
  onSelectFile: (file: FileNode) => void;
  onCloseFile: (id: string) => void;
}

export function TabBar({ openFiles, activeFileId, onSelectFile, onCloseFile }: TabBarProps) {
  const getFileIcon = (name: string) => {
    return <FileCode className="h-3 w-3" />;
  };

  return (
    <div className="h-9 bg-[#252526] border-b border-[#3C3C3C] flex items-center overflow-x-auto scrollbar-thin">
      {openFiles.map((file) => (
        <div
          key={file.id}
          onClick={() => onSelectFile(file)}
          className={`h-full flex items-center gap-2 px-3 border-r border-[#3C3C3C] cursor-pointer min-w-[120px] group relative transition-all ${
            activeFileId === file.id
              ? "bg-[#1E1E1E] border-t-2 border-t-primary"
              : "bg-[#252526] hover:bg-[#2A2A2A]"
          }`}
        >
          <div className={`${activeFileId === file.id ? "text-primary" : "text-[#9C9C9C]"}`}>
            {getFileIcon(file.name)}
          </div>
          <span className={`text-xs truncate font-medium ${
            activeFileId === file.id ? "text-[#E0E0E0]" : "text-[#9C9C9C]"
          }`}>
            {file.name}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCloseFile(file.id);
            }}
            className={`${
              activeFileId === file.id ? "opacity-70" : "opacity-0"
            } group-hover:opacity-100 hover:bg-[#3C3C3C] rounded p-0.5 transition-opacity`}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
