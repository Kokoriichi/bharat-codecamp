import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, FileText, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Cheatsheet {
  id: string;
  title: string;
  description: string;
  language: string;
  url: string;
  thumbnail_url?: string;
}

export default function CheatsheetPage() {
  const [cheatsheets, setCheatsheets] = useState<Cheatsheet[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchCheatsheets();
  }, []);

  const fetchCheatsheets = async () => {
    const { data, error } = await supabase
      .from("cheatsheets")
      .select("*")
      .order("language", { ascending: true });

    if (error) {
      toast({
        title: "Error loading cheatsheets",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setCheatsheets(data || []);
    }
  };

  const languages = ["all", ...new Set(cheatsheets.map((cs) => cs.language))];

  const filteredCheatsheets = cheatsheets.filter((cs) => {
    const matchesSearch = cs.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cs.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = selectedLanguage === "all" || cs.language === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Cheatsheets 📋</h1>
          <p className="text-muted-foreground">Quick reference guides for programming languages</p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search cheatsheets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <Badge
                key={lang}
                variant={selectedLanguage === lang ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedLanguage(lang)}
              >
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        {filteredCheatsheets.length === 0 ? (
          <Card className="p-12 text-center bg-card/50">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-xl text-muted-foreground mb-2">No cheatsheets found</p>
            <p className="text-sm text-muted-foreground">
              Cheatsheets will be added to the database soon. You can manually add them through the backend.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCheatsheets.map((cheatsheet) => (
              <Card
                key={cheatsheet.id}
                className="p-6 bg-card hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => window.open(cheatsheet.url, "_blank")}
              >
                {cheatsheet.thumbnail_url && (
                  <img
                    src={cheatsheet.thumbnail_url}
                    alt={cheatsheet.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {cheatsheet.title}
                  </h3>
                  <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                {cheatsheet.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {cheatsheet.description}
                  </p>
                )}
                <Badge variant="secondary">{cheatsheet.language}</Badge>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
