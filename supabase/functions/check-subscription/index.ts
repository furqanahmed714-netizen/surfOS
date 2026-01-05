import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SubscriptionCheckRequest {
  email: string;
}

interface SubscriptionCheckResponse {
  allowed: boolean;
  subscription_details?: {
    customer_id: string;
    subscription_id: string | null;
    status: string;
    price_id: string | null;
    current_period_end: number | null;
  };
  error?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase not configured");
      return new Response(
        JSON.stringify({ allowed: false, error: "Service not configured" } as SubscriptionCheckResponse),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email }: SubscriptionCheckRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ allowed: false, error: "Email required" } as SubscriptionCheckResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const { data: user, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      console.error("Error fetching users:", userError);
      return new Response(
        JSON.stringify({ allowed: false, error: "Failed to fetch user" } as SubscriptionCheckResponse),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const foundUser = user.users.find(u => u.email?.toLowerCase() === normalizedEmail);

    if (!foundUser) {
      return new Response(
        JSON.stringify({ allowed: false, error: "User not found" } as SubscriptionCheckResponse),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: customer, error: customerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', foundUser.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (customerError) {
      console.error("Error fetching customer:", customerError);
      return new Response(
        JSON.stringify({ allowed: false, error: "Failed to fetch customer data" } as SubscriptionCheckResponse),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!customer) {
      return new Response(
        JSON.stringify({ allowed: false } as SubscriptionCheckResponse),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: subscription, error: subscriptionError } = await supabase
      .from('stripe_subscriptions')
      .select('*')
      .eq('customer_id', customer.customer_id)
      .is('deleted_at', null)
      .maybeSingle();

    if (subscriptionError) {
      console.error("Error fetching subscription:", subscriptionError);
      return new Response(
        JSON.stringify({ allowed: false, error: "Failed to fetch subscription data" } as SubscriptionCheckResponse),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!subscription) {
      return new Response(
        JSON.stringify({ allowed: false } as SubscriptionCheckResponse),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const isActive = subscription.status === 'active' || subscription.status === 'trialing';

    if (isActive) {
      return new Response(
        JSON.stringify({
          allowed: true,
          subscription_details: {
            customer_id: subscription.customer_id,
            subscription_id: subscription.subscription_id,
            status: subscription.status,
            price_id: subscription.price_id,
            current_period_end: subscription.current_period_end,
          },
        } as SubscriptionCheckResponse),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ allowed: false } as SubscriptionCheckResponse),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ allowed: false, error: "Internal server error" } as SubscriptionCheckResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});