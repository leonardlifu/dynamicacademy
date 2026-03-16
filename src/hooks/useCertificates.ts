import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useCertificates = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: certificates, isLoading } = useQuery({
    queryKey: ['certificates', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const generateCertificate = useMutation({
    mutationFn: async (courseId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('generate-certificate', {
        body: { courseId },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success(data.message || 'Certificate issued!');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return {
    certificates,
    isLoading,
    generateCertificate: generateCertificate.mutate,
    isGenerating: generateCertificate.isPending,
  };
};

export const useCertificateByNumber = (certNumber: string) => {
  return useQuery({
    queryKey: ['certificate', certNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_number', certNumber)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!certNumber,
  });
};
