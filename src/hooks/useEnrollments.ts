import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useEnrollments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['enrollments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error('Must be logged in to enroll');
      
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success('Successfully enrolled in course!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to enroll');
    },
  });

  const isEnrolled = (courseId: string) => {
    return enrollments?.some(e => e.course_id === courseId) ?? false;
  };

  return {
    enrollments,
    isLoading,
    enroll: enrollMutation.mutate,
    isEnrolling: enrollMutation.isPending,
    isEnrolled,
  };
};
