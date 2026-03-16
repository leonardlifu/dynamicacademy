
-- Create certificates table
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_number text NOT NULL UNIQUE,
  issued_at timestamp with time zone NOT NULL DEFAULT now(),
  full_name text NOT NULL,
  course_title text NOT NULL,
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Anyone can view a certificate by its ID (for shareable links)
CREATE POLICY "Certificates are publicly viewable" ON public.certificates
  FOR SELECT TO public USING (true);

-- Only the system (edge function with service role) inserts certificates
-- No INSERT/UPDATE/DELETE policies for regular users

-- Admins can manage certificates
CREATE POLICY "Admins can manage certificates" ON public.certificates
  FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));
