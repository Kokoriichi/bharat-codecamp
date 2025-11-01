import { ChevronRight, FolderOpen } from "lucide-react";

interface BreadcrumbProps {
  path: string[];
}

export function Breadcrumb({ path }: BreadcrumbProps) {
  return (
    <div className="h-8 bg-[#1E1E1E] border-b border-[#3C3C3C] flex items-center px-4 gap-2 text-xs text-[#9C9C9C]">
      <FolderOpen className="h-3 w-3" />
      {path.map((segment, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="hover:text-[#E0E0E0] cursor-pointer transition-colors">
            {segment}
          </span>
          {idx < path.length - 1 && <ChevronRight className="h-3 w-3" />}
        </div>
      ))}
    </div>
  );
}
