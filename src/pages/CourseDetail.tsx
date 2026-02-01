import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, BookOpen, CheckCircle, Play, ChevronDown, ChevronRight, 
  Award, Users, Star, Download, ArrowLeft
} from 'lucide-react';
import { useCourse, useCourseModules } from '@/hooks/useCourses';
import { useEnrollments } from '@/hooks/useEnrollments';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const difficultyColors = {
  beginner: 'bg-success/10 text-success border-success/20',
  intermediate: 'bg-warning/10 text-warning border-warning/20',
  advanced: 'bg-destructive/10 text-destructive border-destructive/20',
};

const CourseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: course, isLoading: courseLoading } = useCourse(slug || '');
  const { data: modules } = useCourseModules(course?.id || '');
  const { isEnrolled, enroll, isEnrolling } = useEnrollments();

  // Fetch lessons for each module
  const { data: lessonsMap } = useQuery({
    queryKey: ['all-lessons', modules?.map(m => m.id)],
    queryFn: async () => {
      if (!modules?.length) return {};
      
      const map: Record<string, any[]> = {};
      for (const module of modules) {
        const { data } = await supabase
          .from('lessons')
          .select('*')
          .eq('module_id', module.id)
          .order('order_index', { ascending: true });
        map[module.id] = data || [];
      }
      return map;
    },
    enabled: !!modules?.length,
  });

  const handleEnroll = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (course) {
      enroll(course.id);
    }
  };

  if (courseLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="h-96 bg-muted rounded-2xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Link to="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const enrolled = isEnrolled(course.id);

  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Link to="/courses" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Badge 
                    variant="outline" 
                    className={difficultyColors[course.difficulty_level as keyof typeof difficultyColors] || ''}
                  >
                    {course.difficulty_level}
                  </Badge>
                  {course.is_free && (
                    <Badge className="bg-success text-success-foreground">Free</Badge>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
                
                <p className="text-lg text-muted-foreground mb-6">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration_hours} hours
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {modules?.length || 0} modules
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    500+ students
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-warning" />
                    4.9 rating
                  </span>
                </div>

                {/* Course Curriculum */}
                <div className="bg-card rounded-2xl border shadow-card p-6">
                  <h2 className="text-xl font-bold mb-4">Course Curriculum</h2>
                  
                  <Accordion type="multiple" className="space-y-2">
                    {modules?.map((module, index) => (
                      <AccordionItem
                        key={module.id}
                        value={module.id}
                        className="border rounded-xl px-4"
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div className="text-left">
                              <div className="font-medium">{module.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {lessonsMap?.[module.id]?.length || 0} lessons
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            {lessonsMap?.[module.id]?.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                              >
                                <Play className="w-4 h-4 text-muted-foreground" />
                                <span className="flex-1">{lesson.title}</span>
                                <span className="text-sm text-muted-foreground">
                                  {lesson.duration_minutes} min
                                </span>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-24"
              >
                <div className="bg-card rounded-2xl border shadow-card overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-primary/50" />
                  </div>
                  
                  <div className="p-6">
                    <div className="text-center mb-6">
                      {course.is_free ? (
                        <span className="text-4xl font-bold text-success">Free</span>
                      ) : (
                        <span className="text-4xl font-bold">${course.price}</span>
                      )}
                    </div>

                    {enrolled ? (
                      <Link to={`/dashboard/course/${course.id}`} className="block">
                        <Button variant="hero" className="w-full" size="lg">
                          Continue Learning
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </Link>
                    ) : (
                      <Button 
                        variant="hero" 
                        className="w-full" 
                        size="lg"
                        onClick={handleEnroll}
                        disabled={isEnrolling}
                      >
                        {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                      </Button>
                    )}

                    <ul className="mt-6 space-y-3 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span>Lifetime access</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span>{modules?.length || 0} modules</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span>Quizzes & exercises</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-success" />
                        <span>Downloadable resources</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-success" />
                        <span>Certificate of completion</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CourseDetail;
