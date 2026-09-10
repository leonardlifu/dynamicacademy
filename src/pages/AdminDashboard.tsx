import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users, BookOpen, TrendingUp, Award, Bell, LogOut, Search, GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import {
  useAdminCourseStats,
  useAdminEnrollments,
  useAdminQuizResults,
  useAdminStudents,
} from '@/hooks/useAdminData';
import { StudentDetailDialog } from '@/components/admin/StudentDetailDialog';
import { signOut } from '@/lib/supabase';
import { toast } from 'sonner';

type SelectedStudent = { user_id: string; full_name: string | null; email: string | null } | null;

const fmtDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const AdminDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { data: announcements } = useAnnouncements();
  const { data: students, isLoading: loadingStudents } = useAdminStudents();
  const { data: courseStats } = useAdminCourseStats();
  const { data: enrollments } = useAdminEnrollments();
  const { data: quizResults } = useAdminQuizResults();

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SelectedStudent>(null);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = (students ?? []).filter((s) => s.role !== 'admin');
    if (!q) return rows;
    return rows.filter(
      (s) =>
        (s.full_name ?? '').toLowerCase().includes(q) ||
        (s.email ?? '').toLowerCase().includes(q),
    );
  }, [students, search]);

  const passRate = useMemo(() => {
    if (!quizResults || quizResults.length === 0) return 0;
    return Math.round((quizResults.filter((q) => q.passed).length / quizResults.length) * 100);
  }, [quizResults]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) return toast.error('Failed to sign out');
    toast.success('Signed out successfully');
    navigate('/');
  };

  const stats = [
    { label: 'Students', value: filteredStudents.length, icon: Users, color: 'bg-primary/10 text-primary' },
    { label: 'Courses', value: courseStats?.length ?? 0, icon: BookOpen, color: 'bg-success/10 text-success' },
    { label: 'Enrollments', value: enrollments?.length ?? 0, icon: TrendingUp, color: 'bg-accent/10 text-accent' },
    { label: 'Quiz pass rate', value: `${passRate}%`, icon: Award, color: 'bg-warning/10 text-warning' },
  ];

  return (
    <Layout>
      <section className="py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Admin <span className="gradient-text">Dashboard</span>
              </h1>
              <p className="text-muted-foreground">Welcome back, {profile?.full_name || 'Admin'}</p>
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl border shadow-card p-5"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <Tabs defaultValue="students" className="space-y-6">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
              <TabsTrigger value="quizzes">Quiz results</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
            </TabsList>

            {/* Students */}
            <TabsContent value="students" className="space-y-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="bg-card rounded-2xl border shadow-card overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead>Lessons done</TableHead>
                      <TableHead>Avg. quiz</TableHead>
                      <TableHead>Certificates</TableHead>
                      <TableHead>Last active</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingStudents && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          Loading students…
                        </TableCell>
                      </TableRow>
                    )}
                    {!loadingStudents && filteredStudents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No students found.
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredStudents.map((s) => (
                      <TableRow key={s.user_id}>
                        <TableCell>
                          <p className="font-medium">{s.full_name || 'Unnamed student'}</p>
                          <p className="text-xs text-muted-foreground">{s.email}</p>
                        </TableCell>
                        <TableCell>{s.enrollments_count}</TableCell>
                        <TableCell>{s.lessons_completed}</TableCell>
                        <TableCell>
                          {s.avg_quiz_score !== null ? `${s.avg_quiz_score}%` : '—'}
                        </TableCell>
                        <TableCell>{s.certificates_count}</TableCell>
                        <TableCell className="whitespace-nowrap">{fmtDate(s.last_active)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setSelected({ user_id: s.user_id, full_name: s.full_name, email: s.email })
                            }
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Enrollments */}
            <TabsContent value="enrollments">
              <div className="bg-card rounded-2xl border shadow-card overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead className="min-w-[160px]">Progress</TableHead>
                      <TableHead>Lessons</TableHead>
                      <TableHead>Enrolled</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(!enrollments || enrollments.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No enrollments yet.
                        </TableCell>
                      </TableRow>
                    )}
                    {enrollments?.map((e) => (
                      <TableRow key={e.enrollment_id}>
                        <TableCell>
                          <p className="font-medium">{e.full_name || 'Unnamed student'}</p>
                          <p className="text-xs text-muted-foreground">{e.email}</p>
                        </TableCell>
                        <TableCell>{e.course_title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={Number(e.progress_percentage) || 0} className="h-2 w-24" />
                            <span className="text-xs text-muted-foreground">
                              {Math.round(Number(e.progress_percentage) || 0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{e.lessons_completed}</TableCell>
                        <TableCell className="whitespace-nowrap">{fmtDate(e.enrolled_at)}</TableCell>
                        <TableCell>
                          <Badge variant={e.completed_at ? 'default' : 'secondary'}>
                            {e.completed_at ? 'Completed' : 'In progress'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Quiz results */}
            <TabsContent value="quizzes">
              <div className="bg-card rounded-2xl border shadow-card overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Lesson</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(!quizResults || quizResults.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No quiz attempts yet.
                        </TableCell>
                      </TableRow>
                    )}
                    {quizResults?.map((q) => (
                      <TableRow key={q.attempt_id}>
                        <TableCell>
                          <p className="font-medium">{q.full_name || 'Unnamed student'}</p>
                          <p className="text-xs text-muted-foreground">{q.email}</p>
                        </TableCell>
                        <TableCell>{q.lesson_title}</TableCell>
                        <TableCell>{q.course_title}</TableCell>
                        <TableCell className="font-semibold">{q.score}%</TableCell>
                        <TableCell>
                          <Badge variant={q.passed ? 'default' : 'destructive'}>
                            {q.passed ? 'Passed' : 'Failed'}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{fmtDate(q.attempted_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Courses */}
            <TabsContent value="courses">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseStats?.map((c) => (
                  <div key={c.course_id} className="bg-card rounded-2xl border shadow-card p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <p className="font-semibold truncate">{c.title}</p>
                      </div>
                      <Badge variant={c.is_published ? 'default' : 'secondary'}>
                        {c.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Enrolled</p>
                        <p className="font-semibold">{c.enrollments_count}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completed</p>
                        <p className="font-semibold">{c.completed_count}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Lessons</p>
                        <p className="font-semibold">{c.lessons_total}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg. quiz</p>
                        <p className="font-semibold">
                          {c.avg_quiz_score !== null ? `${c.avg_quiz_score}%` : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Average progress</span>
                        <span>{Math.round(Number(c.avg_progress) || 0)}%</span>
                      </div>
                      <Progress value={Number(c.avg_progress) || 0} className="h-2" />
                    </div>
                  </div>
                ))}
                {(!courseStats || courseStats.length === 0) && (
                  <p className="text-muted-foreground">No courses yet.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Recent announcements */}
          <div className="mt-10 bg-card rounded-2xl border shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent announcements</h2>
              <Link to="/announcements">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {announcements?.slice(0, 3).map((a) => (
                <div key={a.id} className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium">{a.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{a.content}</p>
                </div>
              ))}
              {(!announcements || announcements.length === 0) && (
                <p className="text-muted-foreground text-center py-4">No announcements yet</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <StudentDetailDialog student={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </Layout>
  );
};

export default AdminDashboard;
