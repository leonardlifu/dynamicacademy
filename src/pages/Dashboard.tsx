import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, Clock, Trophy, ArrowRight, LogOut, 
  Bell, Play, CheckCircle, User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEnrollments } from '@/hooks/useEnrollments';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useCertificates } from '@/hooks/useCertificates';
import { signOut } from '@/lib/supabase';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { enrollments, isLoading } = useEnrollments();
  const { data: announcements } = useAnnouncements();
  const { certificates } = useCertificates();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
      return;
    }
    toast.success('Signed out successfully');
    navigate('/');
  };

  const latestAnnouncement = announcements?.[0];

  return (
    <Layout>
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, <span className="gradient-text">{profile?.full_name || 'Student'}</span>!
              </h1>
              <p className="text-muted-foreground">Continue your learning journey</p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/announcements">
                <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4" />
                  Announcements
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-card rounded-xl border shadow-card p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{enrollments?.length || 0}</p>
                  <p className="text-muted-foreground text-sm">Enrolled Courses</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border shadow-card p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {enrollments?.filter(e => e.completed_at).length || 0}
                  </p>
                  <p className="text-muted-foreground text-sm">Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border shadow-card p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{certificates?.length || 0}</p>
                  <Link to="/certificates" className="text-muted-foreground text-sm hover:text-primary transition-colors">Certificates</Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Latest Announcement */}
          {latestAnnouncement && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border p-6 mb-8"
            >
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold">{latestAnnouncement.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                    {latestAnnouncement.content}
                  </p>
                </div>
                <Link to="/announcements">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* My Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">My Courses</h2>
              <Link to="/courses">
                <Button variant="outline" size="sm">
                  Browse More
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="h-64 bg-muted rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : enrollments?.length === 0 ? (
              <div className="bg-card rounded-2xl border shadow-card p-12 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start your learning journey by enrolling in a course
                </p>
                <Link to="/courses">
                  <Button variant="hero">
                    Browse Courses
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments?.map((enrollment) => (
                  <motion.div
                    key={enrollment.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card rounded-2xl border shadow-card overflow-hidden card-hover"
                  >
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-primary/50" />
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-bold text-lg mb-2">
                        {(enrollment.course as any)?.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Clock className="w-4 h-4" />
                        <span>{(enrollment.course as any)?.duration_hours}h total</span>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span className="font-medium">{Math.round(Number(enrollment.progress_percentage))}%</span>
                        </div>
                        <Progress value={Number(enrollment.progress_percentage)} className="h-2" />
                      </div>

                      <Link to={`/learn/${(enrollment.course as any)?.slug}`}>
                        <Button className="w-full">
                          <Play className="w-4 h-4" />
                          Continue Learning
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
