DROP TRIGGER IF EXISTS trg_apply_lesson_note_seed ON public._lesson_notes_seed;
DROP TABLE IF EXISTS public._lesson_notes_seed;
DROP FUNCTION IF EXISTS public._apply_lesson_note_seed();