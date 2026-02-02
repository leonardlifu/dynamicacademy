-- Fix 1: Remove user INSERT access to user_roles (prevents privilege escalation)
-- The trigger already handles role creation securely
DROP POLICY IF EXISTS "Users can insert their own role on signup" ON public.user_roles;

-- Fix 2: Restrict profiles visibility - only authenticated users can view, and hide email from non-owners
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create policy: Users can only see their own profile's sensitive data
CREATE POLICY "Users can view their own full profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- Create a safe view for public profile info (without email)
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT id, user_id, full_name, avatar_url, bio, created_at
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_public TO anon;

-- Fix 3: Strengthen messages RLS policy - ensure proper ownership validation
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

-- Users can only see messages they sent or received
CREATE POLICY "Users can view messages they are part of"
ON public.messages FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (auth.uid() = sender_id OR auth.uid() = recipient_id)
);

-- Users can only send messages as themselves
CREATE POLICY "Users can send messages as themselves"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = sender_id
);

-- Fix 4: Create secure view for quiz questions (without correct_answer)
CREATE OR REPLACE VIEW public.quiz_questions_safe AS
SELECT id, quiz_id, question, options, explanation, order_index, created_at
FROM public.quiz_questions;

GRANT SELECT ON public.quiz_questions_safe TO authenticated;

-- Fix 5: Restrict direct enrollment - only allow for free courses
-- Paid courses require going through edge function with payment verification
DROP POLICY IF EXISTS "Users can enroll themselves" ON public.enrollments;

-- Only allow direct enrollment for free courses
CREATE POLICY "Users can enroll in free courses"
ON public.enrollments FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.courses c 
    WHERE c.id = course_id AND c.is_free = true
  )
);

-- Create a function for secure quiz grading (admin access to correct answers)
CREATE OR REPLACE FUNCTION public.grade_quiz_attempt(
  p_quiz_id UUID,
  p_answers JSONB
)
RETURNS TABLE(score INTEGER, passed BOOLEAN, total_questions INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_correct_count INTEGER := 0;
  v_total INTEGER := 0;
  v_passing_score INTEGER;
  v_question RECORD;
BEGIN
  -- Get passing score
  SELECT COALESCE(passing_score, 70) INTO v_passing_score
  FROM quizzes WHERE id = p_quiz_id;
  
  -- Count correct answers
  FOR v_question IN 
    SELECT qq.id, qq.correct_answer, qq.order_index
    FROM quiz_questions qq
    WHERE qq.quiz_id = p_quiz_id
    ORDER BY qq.order_index
  LOOP
    v_total := v_total + 1;
    
    -- Check if the answer at this index matches
    IF (p_answers->>(v_question.order_index)::text)::integer = v_question.correct_answer THEN
      v_correct_count := v_correct_count + 1;
    END IF;
  END LOOP;
  
  -- Calculate score percentage
  IF v_total > 0 THEN
    score := (v_correct_count * 100) / v_total;
  ELSE
    score := 0;
  END IF;
  
  passed := score >= v_passing_score;
  total_questions := v_total;
  
  RETURN NEXT;
END;
$$;