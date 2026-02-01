import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  thumbnail_url: string | null;
  difficulty_level: string | null;
  is_free: boolean;
  price: number | null;
  duration_hours: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string | null;
  content_type: string | null;
  order_index: number;
  duration_minutes: number | null;
  resources: unknown;
}

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Course[];
    },
  });
};

export const useCourse = (slug: string) => {
  return useQuery({
    queryKey: ['course', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      return data as Course | null;
    },
    enabled: !!slug,
  });
};

export const useCourseModules = (courseId: string) => {
  return useQuery({
    queryKey: ['modules', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as Module[];
    },
    enabled: !!courseId,
  });
};

export const useModuleLessons = (moduleId: string) => {
  return useQuery({
    queryKey: ['lessons', moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!moduleId,
  });
};

export const useCourseLessons = (courseId: string) => {
  return useQuery({
    queryKey: ['course-lessons', courseId],
    queryFn: async () => {
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', courseId);
      
      if (modulesError) throw modulesError;
      
      const moduleIds = modules.map(m => m.id);
      
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .in('module_id', moduleIds)
        .order('order_index', { ascending: true });
      
      if (lessonsError) throw lessonsError;
      return lessons as Lesson[];
    },
    enabled: !!courseId,
  });
};
