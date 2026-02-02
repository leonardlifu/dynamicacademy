-- Fix the views to use security_invoker instead of security_definer
-- This ensures RLS policies are applied based on the querying user, not the view owner

-- Drop and recreate profiles_public view with security_invoker
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT id, user_id, full_name, avatar_url, bio, created_at
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_public TO anon;

-- Drop and recreate quiz_questions_safe view with security_invoker  
DROP VIEW IF EXISTS public.quiz_questions_safe;
CREATE VIEW public.quiz_questions_safe
WITH (security_invoker = on) AS
SELECT id, quiz_id, question, options, explanation, order_index, created_at
FROM public.quiz_questions;

GRANT SELECT ON public.quiz_questions_safe TO authenticated;

-- Also need to restrict direct SELECT on quiz_questions to only admins
-- Drop the permissive policy that exposes correct_answer
DROP POLICY IF EXISTS "Quiz questions are viewable with quiz access" ON public.quiz_questions;

-- Students should use the safe view, only admins can access the base table
-- The admin ALL policy already covers this