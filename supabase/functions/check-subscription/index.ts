import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ALLOWED_PRODUCT_IDS = [
  "prod_QoUqOoMexbgjc9",
  "prod_QuWyNV1zUMs1h4",
  "prod_QoUnoBGoREDINw",
  "prod_QmCbTZPv52uu40",
  "prod_T1dPbxEjnMkFzY"
];

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
    subscription_id: string;
    status: string;
    product_id: string;
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
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ allowed: false, error: "Stripe not configured" } as SubscriptionCheckResponse),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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

    const customersResponse = await fetch(
      `https://api.stripe.com/v1/customers?email=${encodeURIComponent(normalizedEmail)}`,
      {
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
        },
      }
    );

    if (!customersResponse.ok) {
      console.error("Stripe customers API error:", await customersResponse.text());
      return new Response(
        JSON.stringify({ allowed: false, error: "Failed to check subscription" } as SubscriptionCheckResponse),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const customersData = await customersResponse.json();
    const customers = customersData.data || [];

    if (customers.length === 0) {
      return new Response(
        JSON.stringify({ allowed: false } as SubscriptionCheckResponse),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    for (const customer of customers) {
      const subscriptionsResponse = await fetch(
        `https://api.stripe.com/v1/subscriptions?customer=${customer.id}&status=all`,
        {
          headers: {
            Authorization: `Bearer ${stripeSecretKey}`,
          },
        }
      );

      if (!subscriptionsResponse.ok) {
        console.error("Stripe subscriptions API error:", await subscriptionsResponse.text());
        continue;
      }

      const subscriptionsData = await subscriptionsResponse.json();
      const subscriptions = subscriptionsData.data || [];

      const validSubscriptions = subscriptions.filter(
        (sub: any) => sub.status === "active" || sub.status === "trialing"
      );

      for (const subscription of validSubscriptions) {
        for (const item of subscription.items.data) {
          const productId = item.price?.product;
          
          if (productId && ALLOWED_PRODUCT_IDS.includes(productId)) {
            return new Response(
              JSON.stringify({
                allowed: true,
                subscription_details: {
                  customer_id: customer.id,
                  subscription_id: subscription.id,
                  status: subscription.status,
                  product_id: productId,
                },
              } as SubscriptionCheckResponse),
              {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
        }
      }
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