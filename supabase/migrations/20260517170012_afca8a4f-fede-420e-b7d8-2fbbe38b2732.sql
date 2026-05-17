CREATE TABLE IF NOT EXISTS public._lesson_notes_seed (
  lesson_id uuid PRIMARY KEY,
  content text NOT NULL
);
ALTER TABLE public._lesson_notes_seed ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public._apply_lesson_note_seed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.lessons SET content = NEW.content, updated_at = now()
  WHERE id = NEW.lesson_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_lesson_note_seed ON public._lesson_notes_seed;
CREATE TRIGGER trg_apply_lesson_note_seed
AFTER INSERT ON public._lesson_notes_seed
FOR EACH ROW EXECUTE FUNCTION public._apply_lesson_note_seed();