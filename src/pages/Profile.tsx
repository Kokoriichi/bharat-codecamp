import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Flame, BookOpen, FileText, Trophy, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
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

interface UserStats {
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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    daily_streak: 0,
    total_lessons_completed: 0,
    total_notes: 0,
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserAndProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setStats({
        daily_streak: profile.daily_streak,
        total_lessons_completed: profile.total_lessons_completed,
        total_notes: profile.total_notes,
      });
      generateAchievements({
        daily_streak: profile.daily_streak,
        total_lessons_completed: profile.total_lessons_completed,
        total_notes: profile.total_notes,
      });
    }
  }, [profile]);

  const fetchUserAndProfile = async () => {
    try {
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!currentUser) return;

      setUser(currentUser);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
        return;
      }

      if (profileData) {
        setProfile(profileData);
      }
    } catch (error: any) {
      console.error('Error in fetchUserAndProfile:', error);
    }
  };

  const generateAchievements = (stats: UserStats) => {
    const achievementsList: Achievement[] = [
      {
        icon: <Award className="h-6 w-6" />,
        title: "First Steps",
        description: "Complete your first lesson",
        unlocked: stats.total_lessons_completed >= 1,
      },
      {
        icon: <Flame className="h-6 w-6" />,
        title: "Week Warrior",
        description: "Maintain a 7-day streak",
        unlocked: stats.daily_streak >= 7,
      },
      {
        icon: <BookOpen className="h-6 w-6" />,
        title: "Knowledge Seeker",
        description: "Complete 10 lessons",
        unlocked: stats.total_lessons_completed >= 10,
      },
      {
        icon: <FileText className="h-6 w-6" />,
        title: "Note Taker",
        description: "Create 5 notes",
        unlocked: stats.total_notes >= 5,
      },
      {
        icon: <Trophy className="h-6 w-6" />,
        title: "Dedicated Learner",
        description: "Maintain a 30-day streak",
        unlocked: stats.daily_streak >= 30,
      },
    ];

    setAchievements(achievementsList);
  };

  if (!user || !profile) {
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
        <UserIcon className="h-8 w-8 text-primary" />
        My Profile
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-10 w-10 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-2xl">{profile.full_name || "User"}</CardTitle>
              <CardDescription>{profile.email || user.email}</CardDescription>
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
              <div className="text-4xl font-bold">{stats.daily_streak}</div>
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
              <div className="text-4xl font-bold">{stats.total_lessons_completed}</div>
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
              <div className="text-4xl font-bold">{stats.total_notes}</div>
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
