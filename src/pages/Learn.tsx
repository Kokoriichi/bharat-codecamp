import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlayCircle, CheckCircle2, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  markdown_notes: string;
  difficulty: string;
  language: string;
  thumbnail_url: string;
}

interface UserProgress {
  lesson_id: string;
  completed: boolean;
}

export default function Learn() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLessons();
    fetchUserProgress();
  }, []);

  const fetchLessons = async () => {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .order("order_index");

    if (error) {
      toast({
        title: "Error loading lessons",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setLessons(data || []);
    }
    setIsLoading(false);
  };

  const fetchUserProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_progress")
      .select("lesson_id, completed")
      .eq("user_id", user.id);

    setUserProgress(data || []);
  };

  const markAsComplete = async (lessonId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("user_progress")
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Lesson completed! 🎉",
        description: "Keep up the great work!",
      });
      fetchUserProgress();
      
      // Update streak
      await supabase.rpc("update_user_streak", { user_uuid: user.id });
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return userProgress.some((p) => p.lesson_id === lessonId && p.completed);
  };

  const completionPercentage = lessons.length > 0
    ? (userProgress.filter((p) => p.completed).length / lessons.length) * 100
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Learning Path
          </h1>
          <p className="text-muted-foreground mt-1">
            Master programming with curated lessons
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground mb-2">Your Progress</div>
          <div className="flex items-center gap-3">
            <Progress value={completionPercentage} className="w-32" />
            <span className="font-bold text-primary">{Math.round(completionPercentage)}%</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted" />
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group border-border"
                onClick={() => setSelectedLesson(lesson)}
              >
                <div className="relative h-48 bg-card overflow-hidden">
                  <img
                    src={lesson.thumbnail_url || "/placeholder.svg"}
                    alt={lesson.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {isLessonCompleted(lesson.id) && (
                    <div className="absolute top-2 right-2 bg-success text-success-foreground p-2 rounded-full">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="h-16 w-16 text-white" />
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="capitalize">
                      {lesson.difficulty}
                    </Badge>
                    <Badge variant="outline" className="uppercase">
                      {lesson.language}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-1">{lesson.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {lesson.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedLesson?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedLesson && (
            <div className="space-y-6">
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  src={selectedLesson.video_url}
                  className="w-full h-full"
                  allowFullScreen
                  title={selectedLesson.title}
                />
              </div>

              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{selectedLesson.markdown_notes}</ReactMarkdown>
              </div>

              <Button
                onClick={() => {
                  markAsComplete(selectedLesson.id);
                  setSelectedLesson(null);
                }}
                className="w-full"
                disabled={isLessonCompleted(selectedLesson.id)}
              >
                {isLessonCompleted(selectedLesson.id) ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Completed
                  </>
                ) : (
                  "Mark as Complete"
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
