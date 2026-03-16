import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, 
  BookOpen, Clock, Play, FileText, HelpCircle
} from 'lucide-react';
import { useCourse, useCourseModules } from '@/hooks/useCourses';
import { useEnrollments } from '@/hooks/useEnrollments';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useCertificates } from '@/hooks/useCertificates';

const Learn = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: course, isLoading: courseLoading } = useCourse(slug || '');
  const { data: modules } = useCourseModules(course?.id || '');
  const { isEnrolled } = useEnrollments();
  const { generateCertificate } = useCertificates();

  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch all lessons for the course
  const { data: allLessons } = useQuery({
    queryKey: ['course-all-lessons', course?.id],
    queryFn: async () => {
      if (!modules?.length) return [];
      
      const moduleIds = modules.map(m => m.id);
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .in('module_id', moduleIds)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!modules?.length,
  });

  // Fetch lesson progress
  const { data: lessonProgress } = useQuery({
    queryKey: ['lesson-progress', user?.id, course?.id],
    queryFn: async () => {
      if (!user || !allLessons?.length) return [];
      
      const lessonIds = allLessons.map(l => l.id);
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!allLessons?.length,
  });

  // Mark lesson complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      if (!user) throw new Error('Must be logged in');
      
      const { data, error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, lessonId) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success('Lesson completed!');
      
      // Check if all lessons are now complete → issue certificate
      if (allLessons && course) {
        const nowCompleted = new Set(
          (lessonProgress || []).filter(p => p.is_completed).map(p => p.lesson_id)
        );
        nowCompleted.add(lessonId);
        if (allLessons.every(l => nowCompleted.has(l.id))) {
          generateCertificate(course.id);
        }
      }
    },
  });

  // Set initial lesson
  if (allLessons?.length && !currentLessonId) {
    const firstIncomplete = allLessons.find(l => 
      !lessonProgress?.some(p => p.lesson_id === l.id && p.is_completed)
    );
    setCurrentLessonId(firstIncomplete?.id || allLessons[0].id);
  }

  const currentLesson = allLessons?.find(l => l.id === currentLessonId);
  const currentModule = modules?.find(m => m.id === currentLesson?.module_id);
  
  const currentIndex = allLessons?.findIndex(l => l.id === currentLessonId) ?? 0;
  const prevLesson = allLessons?.[currentIndex - 1];
  const nextLesson = allLessons?.[currentIndex + 1];

  const completedCount = lessonProgress?.filter(p => p.is_completed).length || 0;
  const totalLessons = allLessons?.length || 0;
  const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  const isLessonComplete = (lessonId: string) => {
    return lessonProgress?.some(p => p.lesson_id === lessonId && p.is_completed);
  };

  if (courseLoading) {
    return (
      <Layout showFooter={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!course || (course && !course.is_free && !isEnrolled(course.id))) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">Please enroll in this course to access the content.</p>
          <Link to={`/courses/${slug}`}>
            <Button>View Course</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-card border-b z-40 flex items-center px-4">
        <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Dashboard</span>
        </Link>
        
        <div className="flex-1 flex items-center justify-center gap-4 px-4">
          <span className="font-medium truncate">{course.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {Math.round(progressPercent)}% complete
          </span>
          <Progress value={progressPercent} className="w-24 h-2" />
        </div>
      </div>

      <div className="flex pt-16">
        {/* Sidebar */}
        <div className={`fixed left-0 top-16 bottom-0 w-80 bg-card border-r overflow-y-auto transition-transform ${sidebarOpen ? '' : '-translate-x-full'}`}>
          <div className="p-4">
            <h2 className="font-bold text-lg mb-4">Course Content</h2>
            
            {modules?.map((module, moduleIndex) => {
              const moduleLessons = allLessons?.filter(l => l.module_id === module.id) || [];
              
              return (
                <div key={module.id} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {moduleIndex + 1}
                    </div>
                    <span className="font-medium text-sm">{module.title}</span>
                  </div>
                  
                  <div className="ml-4 space-y-1">
                    {moduleLessons.map((lesson) => {
                      const isComplete = isLessonComplete(lesson.id);
                      const isCurrent = lesson.id === currentLessonId;
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLessonId(lesson.id)}
                          className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${
                            isCurrent 
                              ? 'bg-primary/10 text-primary' 
                              : 'hover:bg-muted'
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle className="w-4 h-4 text-success shrink-0" />
                          ) : lesson.content_type === 'quiz' ? (
                            <HelpCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                          ) : (
                            <Play className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                          <span className="truncate">{lesson.title}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {lesson.duration_minutes}m
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 transition-all ${sidebarOpen ? 'ml-80' : ''}`}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-card border rounded-r-lg p-2 shadow-md"
            style={{ left: sidebarOpen ? '320px' : '0' }}
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <div className="max-w-4xl mx-auto p-8">
            {currentLesson && (
              <motion.div
                key={currentLesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-6">
                  <p className="text-sm text-primary font-medium mb-2">
                    {currentModule?.title}
                  </p>
                  <h1 className="text-3xl font-bold mb-2">{currentLesson.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {currentLesson.duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {currentLesson.content_type}
                    </span>
                  </div>
                </div>

                <div className="bg-card rounded-2xl border shadow-card p-8 mb-8">
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    {currentLesson.content?.split('\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => prevLesson && setCurrentLessonId(prevLesson.id)}
                    disabled={!prevLesson}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <Button
                    variant={isLessonComplete(currentLesson.id) ? 'outline' : 'hero'}
                    onClick={() => markCompleteMutation.mutate(currentLesson.id)}
                    disabled={markCompleteMutation.isPending}
                  >
                    {isLessonComplete(currentLesson.id) ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Completed
                      </>
                    ) : (
                      'Mark as Complete'
                    )}
                  </Button>

                  <Button
                    onClick={() => nextLesson && setCurrentLessonId(nextLesson.id)}
                    disabled={!nextLesson}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;
