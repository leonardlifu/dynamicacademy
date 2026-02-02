import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EnrollRequest {
  courseId: string;
  paymentConfirmation?: string; // For paid courses - placeholder for payment integration
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Get user auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token for auth check
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user from token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { courseId, paymentConfirmation }: EnrollRequest = await req.json();

    if (!courseId) {
      return new Response(
        JSON.stringify({ error: "Course ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client for database operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check if course exists and get its details
    const { data: course, error: courseError } = await adminClient
      .from("courses")
      .select("id, title, is_free, price, is_published")
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      return new Response(
        JSON.stringify({ error: "Course not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!course.is_published) {
      return new Response(
        JSON.stringify({ error: "Course is not available for enrollment" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await adminClient
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existingEnrollment) {
      return new Response(
        JSON.stringify({ error: "Already enrolled in this course" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For paid courses, verify payment
    if (!course.is_free) {
      // TODO: Integrate with payment provider (Stripe, etc.)
      // For now, paid courses require explicit payment confirmation
      // This is a placeholder - in production, verify with payment provider
      if (!paymentConfirmation) {
        return new Response(
          JSON.stringify({ 
            error: "Payment required", 
            requiresPayment: true,
            price: course.price,
            courseTitle: course.title
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // In production: Verify paymentConfirmation with payment provider
      // const isValidPayment = await verifyPayment(paymentConfirmation);
      // if (!isValidPayment) {
      //   return new Response(
      //     JSON.stringify({ error: "Invalid payment" }),
      //     { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      //   );
      // }
    }

    // Create enrollment using admin client (bypasses RLS)
    const { data: enrollment, error: enrollError } = await adminClient
      .from("enrollments")
      .insert({
        user_id: user.id,
        course_id: courseId,
      })
      .select()
      .single();

    if (enrollError) {
      console.error("Enrollment error:", enrollError);
      return new Response(
        JSON.stringify({ error: "Failed to enroll in course" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        enrollment,
        message: `Successfully enrolled in ${course.title}` 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
