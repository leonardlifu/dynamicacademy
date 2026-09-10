import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminStudents = () =>
  useQuery({
    queryKey: ['admin-students'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_list_students');
      if (error) throw error;
      return data ?? [];
    },
  });

export const useAdminCourseStats = () =>
  useQuery({
    queryKey: ['admin-course-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_course_stats');
      if (error) throw error;
      return data ?? [];
    },
  });

export const useAdminEnrollments = () =>
  useQuery({
    queryKey: ['admin-enrollments'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_list_enrollments');
      if (error) throw error;
      return data ?? [];
    },
  });

export const useAdminQuizResults = (userId?: string) =>
  useQuery({
    queryKey: ['admin-quiz-results', userId ?? 'all'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_list_quiz_results', {
        p_user_id: userId ?? undefined,
      });
      if (error) throw error;
      return data ?? [];
    },
  });

export const useAdminStudentProgress = (userId?: string) =>
  useQuery({
    queryKey: ['admin-student-progress', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_student_lesson_progress', {
        p_user_id: userId as string,
      });
      if (error) throw error;
      return data ?? [];
    },
  });
