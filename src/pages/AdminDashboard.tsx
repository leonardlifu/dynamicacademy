import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { 
  Users, BookOpen, TrendingUp, DollarSign, 
  Bell, LogOut, Plus, Settings, BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/hooks/useCourses';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { signOut } from '@/lib/supabase';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const { profile } = useAuth();
  const { data: courses } = useCourses();
  const { data: announcements } = useAnnouncements();
  const navigate = useNavigate();

  // Fetch total enrollments
  const { data: enrollmentsCount } = useQuery({
    queryKey: ['admin-enrollments-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch total users
  const { data: usersCount } = useQuery({
    queryKey: ['admin-users-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
      return;
    }
    toast.success('Signed out successfully');
    navigate('/');
  };

  const stats = [
    {
      label: 'Total Students',
      value: usersCount || 0,
      icon: Users,
      color: 'bg-primary/10 text-primary',
      change: '+12%',
    },
    {
      label: 'Active Courses',
      value: courses?.length || 0,
      icon: BookOpen,
      color: 'bg-success/10 text-success',
      change: '+3',
    },
    {
      label: 'Total Enrollments',
      value: enrollmentsCount || 0,
      icon: TrendingUp,
      color: 'bg-accent/10 text-accent',
      change: '+24%',
    },
    {
      label: 'Revenue',
      value: '$0',
      icon: DollarSign,
      color: 'bg-warning/10 text-warning',
      change: 'Coming soon',
    },
  ];

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
                Admin <span className="gradient-text">Dashboard</span>
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {profile?.full_name || 'Admin'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-card rounded-xl border shadow-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm text-success font-medium">{stat.change}</span>
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <Button variant="outline" className="h-auto p-6 flex flex-col items-start gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Create Course</p>
                <p className="text-sm text-muted-foreground">Add a new course</p>
              </div>
            </Button>

            <Link to="/announcements" className="block">
              <Button variant="outline" className="h-auto p-6 flex flex-col items-start gap-2 w-full">
                <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Post Announcement</p>
                  <p className="text-sm text-muted-foreground">Notify all students</p>
                </div>
              </Button>
            </Link>

            <Button variant="outline" className="h-auto p-6 flex flex-col items-start gap-2">
              <div className="w-10 h-10 rounded-lg bg-success/10 text-success flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">View Analytics</p>
                <p className="text-sm text-muted-foreground">Course performance</p>
              </div>
            </Button>
          </motion.div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Courses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-2xl border shadow-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Courses</h2>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              
              <div className="space-y-4">
                {courses?.slice(0, 4).map((course) => (
                  <div key={course.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{course.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {course.is_free ? 'Free' : `$${course.price}`} • {course.duration_hours}h
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Announcements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-2xl border shadow-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Recent Announcements</h2>
                <Link to="/announcements">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {announcements?.slice(0, 4).map((announcement) => (
                  <div key={announcement.id} className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium">{announcement.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {announcement.content}
                    </p>
                  </div>
                ))}
                {(!announcements || announcements.length === 0) && (
                  <p className="text-muted-foreground text-center py-4">No announcements yet</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AdminDashboard;
