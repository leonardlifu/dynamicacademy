
-- Admin: list all students with aggregate learning stats
CREATE OR REPLACE FUNCTION public.admin_list_students()
RETURNS TABLE (
  user_id uuid,
  full_name text,
  email text,
  role app_role,
  joined_at timestamptz,
  enrollments_count bigint,
  lessons_completed bigint,
  quiz_attempts_count bigint,
  avg_quiz_score numeric,
  certificates_count bigint,
  last_active timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.user_id,
    p.full_name,
    p.email,
    COALESCE(public.get_user_role(p.user_id), 'student'::app_role) AS role,
    p.created_at AS joined_at,
    (SELECT count(*) FROM enrollments e WHERE e.user_id = p.user_id) AS enrollments_count,
    (SELECT count(*) FROM lesson_progress lp WHERE lp.user_id = p.user_id AND lp.is_completed) AS lessons_completed,
    (SELECT count(*) FROM quiz_attempts qa WHERE qa.user_id = p.user_id) AS quiz_attempts_count,
    (SELECT round(avg(qa.score)) FROM quiz_attempts qa WHERE qa.user_id = p.user_id) AS avg_quiz_score,
    (SELECT count(*) FROM certificates c WHERE c.user_id = p.user_id) AS certificates_count,
    GREATEST(
      COALESCE((SELECT max(e.last_accessed_at) FROM enrollments e WHERE e.user_id = p.user_id), p.created_at),
      COALESCE((SELECT max(qa.attempted_at) FROM quiz_attempts qa WHERE qa.user_id = p.user_id), p.created_at)
    ) AS last_active
  FROM profiles p
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
  ORDER BY p.created_at DESC
$$;

-- Admin: course level enrollment summary
CREATE OR REPLACE FUNCTION public.admin_course_stats()
RETURNS TABLE (
  course_id uuid,
  title text,
  is_published boolean,
  lessons_total bigint,
  enrollments_count bigint,
  completed_count bigint,
  avg_progress numeric,
  avg_quiz_score numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.title,
    c.is_published,
    (SELECT count(*) FROM modules m JOIN lessons l ON l.module_id = m.id WHERE m.course_id = c.id) AS lessons_total,
    (SELECT count(*) FROM enrollments e WHERE e.course_id = c.id) AS enrollments_count,
    (SELECT count(*) FROM enrollments e WHERE e.course_id = c.id AND e.completed_at IS NOT NULL) AS completed_count,
    COALESCE((SELECT round(avg(e.progress_percentage)) FROM enrollments e WHERE e.course_id = c.id), 0) AS avg_progress,
    (SELECT round(avg(qa.score))
       FROM quiz_attempts qa
       JOIN quizzes q ON q.id = qa.quiz_id
       JOIN lessons l ON l.id = q.lesson_id
       JOIN modules m ON m.id = l.module_id
      WHERE m.course_id = c.id) AS avg_quiz_score
  FROM courses c
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
  ORDER BY c.title
$$;

-- Admin: enrollment rows with student + course info
CREATE OR REPLACE FUNCTION public.admin_list_enrollments()
RETURNS TABLE (
  enrollment_id uuid,
  user_id uuid,
  full_name text,
  email text,
  course_id uuid,
  course_title text,
  progress_percentage numeric,
  enrolled_at timestamptz,
  completed_at timestamptz,
  last_accessed_at timestamptz,
  lessons_completed bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    e.id,
    e.user_id,
    p.full_name,
    p.email,
    c.id,
    c.title,
    e.progress_percentage,
    e.enrolled_at,
    e.completed_at,
    e.last_accessed_at,
    (SELECT count(*)
       FROM lesson_progress lp
       JOIN lessons l ON l.id = lp.lesson_id
       JOIN modules m ON m.id = l.module_id
      WHERE lp.user_id = e.user_id AND m.course_id = c.id AND lp.is_completed) AS lessons_completed
  FROM enrollments e
  JOIN courses c ON c.id = e.course_id
  LEFT JOIN profiles p ON p.user_id = e.user_id
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
  ORDER BY e.enrolled_at DESC
$$;

-- Admin: quiz results across all students
CREATE OR REPLACE FUNCTION public.admin_list_quiz_results(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
  attempt_id uuid,
  user_id uuid,
  full_name text,
  email text,
  quiz_title text,
  lesson_title text,
  course_title text,
  score integer,
  passed boolean,
  attempted_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    qa.id,
    qa.user_id,
    p.full_name,
    p.email,
    q.title,
    l.title,
    c.title,
    qa.score,
    qa.passed,
    qa.attempted_at
  FROM quiz_attempts qa
  JOIN quizzes q ON q.id = qa.quiz_id
  JOIN lessons l ON l.id = q.lesson_id
  JOIN modules m ON m.id = l.module_id
  JOIN courses c ON c.id = m.course_id
  LEFT JOIN profiles p ON p.user_id = qa.user_id
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
    AND (p_user_id IS NULL OR qa.user_id = p_user_id)
  ORDER BY qa.attempted_at DESC
  LIMIT 500
$$;

-- Admin: lesson progress detail for one student
CREATE OR REPLACE FUNCTION public.admin_student_lesson_progress(p_user_id uuid)
RETURNS TABLE (
  lesson_id uuid,
  lesson_title text,
  module_title text,
  course_title text,
  is_completed boolean,
  completed_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    l.id,
    l.title,
    m.title,
    c.title,
    COALESCE(lp.is_completed, false),
    lp.completed_at
  FROM enrollments e
  JOIN courses c ON c.id = e.course_id
  JOIN modules m ON m.id = c.id OR m.course_id = c.id
  JOIN lessons l ON l.module_id = m.id
  LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = p_user_id
  WHERE e.user_id = p_user_id
    AND public.has_role(auth.uid(), 'admin'::app_role)
  ORDER BY c.title, m.order_index, l.order_index
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_students() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_course_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_enrollments() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_quiz_results(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_student_lesson_progress(uuid) TO authenticated;
