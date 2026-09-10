
REVOKE ALL ON FUNCTION public.admin_list_students() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_course_stats() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_enrollments() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_quiz_results(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_student_lesson_progress(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_list_students() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_course_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_enrollments() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_quiz_results(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_student_lesson_progress(uuid) TO authenticated;
