import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: file, error: dlError } = await db.storage.from("seed-tmp").download("seed.json");
  if (dlError || !file) {
    return new Response(JSON.stringify({ error: dlError?.message ?? "no file" }), { status: 500 });
  }
  const courses = JSON.parse(await file.text());

  await db.from("courses").update({ is_free: true, price: 0 }).neq("id", "00000000-0000-0000-0000-000000000000");

  const log: string[] = [];
  for (const c of courses) {
    const { data: existing } = await db.from("courses").select("id").eq("slug", c.slug).maybeSingle();
    let courseId = existing?.id as string | undefined;
    if (!courseId) {
      const { data, error } = await db.from("courses").insert({
        title: c.title, slug: c.slug, description: c.desc, short_description: c.short,
        difficulty_level: c.difficulty, is_free: true, price: 0,
        duration_hours: c.hours, is_published: true,
      }).select("id").single();
      if (error) return new Response(JSON.stringify({ step: "course", error: error.message }), { status: 500 });
      courseId = data.id;
    }

    for (const m of c.modules) {
      const { data: exM } = await db.from("modules").select("id").eq("course_id", courseId).eq("title", m.title).maybeSingle();
      let moduleId = exM?.id as string | undefined;
      if (!moduleId) {
        const { data, error } = await db.from("modules")
          .insert({ course_id: courseId, title: m.title, order_index: m.order_index })
          .select("id").single();
        if (error) return new Response(JSON.stringify({ step: "module", error: error.message }), { status: 500 });
        moduleId = data.id;
      }

      for (const l of m.lessons) {
        const { data: exL } = await db.from("lessons").select("id").eq("module_id", moduleId).eq("title", l.title).maybeSingle();
        let lessonId = exL?.id as string | undefined;
        if (!lessonId) {
          const { data, error } = await db.from("lessons").insert({
            module_id: moduleId, title: l.title, content: l.content, content_type: "text",
            order_index: l.order_index, duration_minutes: 15, resources: l.resources,
          }).select("id").single();
          if (error) return new Response(JSON.stringify({ step: "lesson", error: error.message }), { status: 500 });
          lessonId = data.id;
        }

        const { data: exQ } = await db.from("quizzes").select("id").eq("lesson_id", lessonId).maybeSingle();
        let quizId = exQ?.id as string | undefined;
        if (!quizId) {
          const { data, error } = await db.from("quizzes").insert({
            lesson_id: lessonId, title: `Quiz: ${l.title}`,
            description: "Answer all questions to unlock the next lesson.", passing_score: 70,
          }).select("id").single();
          if (error) return new Response(JSON.stringify({ step: "quiz", error: error.message }), { status: 500 });
          quizId = data.id;
        }

        const { count } = await db.from("quiz_questions").select("id", { count: "exact", head: true }).eq("quiz_id", quizId);
        if (!count) {
          const rows = l.questions.map((q: Record<string, unknown>, i: number) => ({
            quiz_id: quizId, question: q.question, options: q.options,
            correct_answer: q.correct_answer, explanation: q.explanation ?? "", order_index: i,
          }));
          const { error } = await db.from("quiz_questions").insert(rows);
          if (error) return new Response(JSON.stringify({ step: "questions", error: error.message }), { status: 500 });
        }
        log.push(l.title);
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, lessons: log.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
