import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth client to get the user
    const authClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return new Response(JSON.stringify({ error: "courseId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service role client for privileged operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check if certificate already exists
    const { data: existing } = await adminClient
      .from("certificates")
      .select("id, certificate_number")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ success: true, certificate: existing, message: "Certificate already issued" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify enrollment
    const { data: enrollment } = await adminClient
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (!enrollment) {
      return new Response(JSON.stringify({ error: "Not enrolled in this course" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all lessons for this course
    const { data: modules } = await adminClient
      .from("modules")
      .select("id")
      .eq("course_id", courseId);

    if (!modules?.length) {
      return new Response(JSON.stringify({ error: "Course has no modules" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const moduleIds = modules.map((m: { id: string }) => m.id);
    const { data: lessons } = await adminClient
      .from("lessons")
      .select("id")
      .in("module_id", moduleIds);

    if (!lessons?.length) {
      return new Response(JSON.stringify({ error: "Course has no lessons" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check all lessons are completed
    const lessonIds = lessons.map((l: { id: string }) => l.id);
    const { data: progress } = await adminClient
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .in("lesson_id", lessonIds)
      .eq("is_completed", true);

    const completedIds = new Set((progress || []).map((p: { lesson_id: string }) => p.lesson_id));
    const allComplete = lessonIds.every((id: string) => completedIds.has(id));

    if (!allComplete) {
      return new Response(
        JSON.stringify({
          error: "Not all lessons completed",
          completed: completedIds.size,
          total: lessonIds.length,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get course and profile info
    const { data: course } = await adminClient
      .from("courses")
      .select("title")
      .eq("id", courseId)
      .single();

    const { data: profile } = await adminClient
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .single();

    // Generate unique certificate number
    const certNumber = `DA-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const { data: certificate, error: insertError } = await adminClient
      .from("certificates")
      .insert({
        user_id: user.id,
        course_id: courseId,
        certificate_number: certNumber,
        full_name: profile?.full_name || "Student",
        course_title: course?.title || "Course",
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Update enrollment as completed
    await adminClient
      .from("enrollments")
      .update({ completed_at: new Date().toISOString(), progress_percentage: 100 })
      .eq("user_id", user.id)
      .eq("course_id", courseId);

    return new Response(
      JSON.stringify({ success: true, certificate, message: "Certificate issued!" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
