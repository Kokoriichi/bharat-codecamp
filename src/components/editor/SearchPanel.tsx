import { useState } from "react";
import { Search, Replace, CaseSensitive, Regex } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchPanelProps {
  onSearch: (query: string, options: SearchOptions) => void;
}

export interface SearchOptions {
  caseSensitive: boolean;
  useRegex: boolean;
}

export function SearchPanel({ onSearch }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [showReplace, setShowReplace] = useState(false);

  const handleSearch = () => {
    onSearch(searchQuery, { caseSensitive, useRegex });
  };

  return (
    <div className="w-64 bg-[#1E1E1E] border-r border-[#3C3C3C] flex flex-col">
      <div className="p-3 border-b border-[#3C3C3C]">
        <div className="text-xs font-semibold text-[#E0E0E0] mb-3 uppercase">Search</div>
        
        <div className="space-y-2">
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search"
              className="bg-[#252526] border-[#3C3C3C] text-[#E0E0E0] text-sm h-8 pr-20"
            />
            <div className="absolute right-1 top-1 flex gap-0.5">
              <Button
                size="sm"
                variant="ghost"
                className={`h-6 w-6 p-0 ${caseSensitive ? 'bg-[#3C3C3C]' : ''}`}
                onClick={() => setCaseSensitive(!caseSensitive)}
                title="Match Case"
              >
                <CaseSensitive className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className={`h-6 w-6 p-0 ${useRegex ? 'bg-[#3C3C3C]' : ''}`}
                onClick={() => setUseRegex(!useRegex)}
                title="Use Regular Expression"
              >
                <Regex className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => setShowReplace(!showReplace)}
                title="Toggle Replace"
              >
                <Replace className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {showReplace && (
            <Input
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              placeholder="Replace"
              className="bg-[#252526] border-[#3C3C3C] text-[#E0E0E0] text-sm h-8"
            />
          )}

          <Button
            onClick={handleSearch}
            className="w-full h-7 text-xs bg-primary hover:bg-primary/90"
          >
            <Search className="h-3 w-3 mr-1" />
            Find All
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <div className="text-xs text-[#9C9C9C]">
          {searchQuery ? "No results found" : "Enter search term to find matches"}
        </div>
      </div>
    </div>
  );
}
