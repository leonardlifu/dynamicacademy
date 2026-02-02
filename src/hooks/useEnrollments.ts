import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface EnrollmentResponse {
  success?: boolean;
  enrollment?: unknown;
  message?: string;
  error?: string;
  requiresPayment?: boolean;
  price?: number;
  courseTitle?: string;
}

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
    mutationFn: async (courseId: string): Promise<EnrollmentResponse> => {
      if (!user) throw new Error('Must be logged in to enroll');
      
      // Use edge function for secure enrollment (handles both free and paid)
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('enroll-in-course', {
        body: { courseId },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to enroll');
      }
      
      const result = response.data as EnrollmentResponse;
      
      // Handle payment required response
      if (result.requiresPayment) {
        throw new Error(`Payment of $${result.price} required for ${result.courseTitle}. Payment integration coming soon!`);
      }
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success(data.message || 'Successfully enrolled in course!');
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
