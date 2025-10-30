import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Flame, BookOpen, FileText, Trophy, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Profile {
  full_name: string;
  email: string;
  avatar_url: string;
  daily_streak: number;
  total_lessons_completed: number;
  total_notes: number;
}

interface Achievement {
  icon: React.ReactNode;
  title: string;
  description: string;
  unlocked: boolean;
}

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      toast({
        title: "Error loading profile",
        description: profileError.message,
        variant: "destructive",
      });
      return;
    }

    // Count lessons completed
    const { count: lessonsCount } = await supabase
      .from("user_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", true);

    // Count notes
    const { count: notesCount } = await supabase
      .from("user_notes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const updatedProfile = {
      ...profileData,
      total_lessons_completed: lessonsCount || 0,
      total_notes: notesCount || 0,
    };

    setProfile(updatedProfile);
    generateAchievements(updatedProfile);
  };

  const generateAchievements = (profile: Profile) => {
    const achievementsList: Achievement[] = [
      {
        icon: <Award className="h-6 w-6" />,
        title: "First Steps",
        description: "Complete your first lesson",
        unlocked: profile.total_lessons_completed >= 1,
      },
      {
        icon: <Flame className="h-6 w-6" />,
        title: "Week Warrior",
        description: "Maintain a 7-day streak",
        unlocked: profile.daily_streak >= 7,
      },
      {
        icon: <BookOpen className="h-6 w-6" />,
        title: "Knowledge Seeker",
        description: "Complete 10 lessons",
        unlocked: profile.total_lessons_completed >= 10,
      },
      {
        icon: <FileText className="h-6 w-6" />,
        title: "Note Taker",
        description: "Create 5 notes",
        unlocked: profile.total_notes >= 5,
      },
      {
        icon: <Trophy className="h-6 w-6" />,
        title: "Dedicated Learner",
        description: "Maintain a 30-day streak",
        unlocked: profile.daily_streak >= 30,
      },
    ];

    setAchievements(achievementsList);
  };

  if (!profile) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-card rounded-lg" />
          <div className="h-48 bg-card rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <User className="h-8 w-8 text-primary" />
        My Profile
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{profile.full_name || "User"}</CardTitle>
              <CardDescription>{profile.email}</CardDescription>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Flame className="h-5 w-5" />
                Daily Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{profile.daily_streak}</div>
              <p className="text-sm text-muted-foreground">days in a row</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <BookOpen className="h-5 w-5" />
                Lessons Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{profile.total_lessons_completed}</div>
              <p className="text-sm text-muted-foreground">lessons mastered</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <FileText className="h-5 w-5" />
                Notes Created
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{profile.total_notes}</div>
              <p className="text-sm text-muted-foreground">notes written</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Achievements
          </CardTitle>
          <CardDescription>Your learning milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`border-border ${achievement.unlocked ? "bg-success/10 border-success" : "opacity-50"}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={achievement.unlocked ? "text-success" : "text-muted-foreground"}>
                        {achievement.icon}
                      </div>
                      {achievement.unlocked && (
                        <Badge className="bg-success text-success-foreground">Unlocked</Badge>
                      )}
                    </div>
                    <CardTitle className="text-base">{achievement.title}</CardTitle>
                    <CardDescription>{achievement.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
