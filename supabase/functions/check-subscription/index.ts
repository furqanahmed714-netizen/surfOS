import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.7.0";

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
    product_title: string;
    current_period_end: number;
    billing_interval: string;
  };
  error?: string;
}

interface SubscriptionData {
  status: string;
  product_title: string;
  product_id: string;
  subscription_id: string;
  current_period_end: number;
  billing_interval: string;
  customer_id: string;
}

async function getSubscriptionsFromStripe(stripe: Stripe, email: string): Promise<SubscriptionData[]> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const customers = await stripe.customers.list({ email: normalizedEmail });
    const allSubscriptions: SubscriptionData[] = [];

    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'all',
        expand: ['data.items.data.price.product'],
      });

      for (const subscription of subscriptions.data) {
        if (subscription.status === 'active' || subscription.status === 'trialing') {
          for (const item of subscription.items.data) {
            const product = item.price.product as Stripe.Product;
            const productId = typeof item.price.product === 'string'
              ? item.price.product
              : product.id;

            allSubscriptions.push({
              status: subscription.status,
              product_title: typeof product === 'object' ? product.name : '',
              product_id: productId,
              subscription_id: subscription.id,
              current_period_end: subscription.current_period_end,
              billing_interval: item.price.recurring?.interval || 'one_time',
              customer_id: customer.id,
            });
          }
        }
      }
    }

    return allSubscriptions;
  } catch (error) {
    console.error('getSubscriptionsFromStripe error:', error);
    return [];
  }
}

function findAllowedSubscription(subscriptions: SubscriptionData[]): { allowed: boolean; subscription?: SubscriptionData } {
  const matchingSubscription = subscriptions.find(sub =>
    ALLOWED_PRODUCT_IDS.includes(sub.product_id)
  );

  return {
    allowed: !!matchingSubscription,
    subscription: matchingSubscription,
  };
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

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    });

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

    console.log(`Checking subscription for email: ${email}`);

    const subscriptions = await getSubscriptionsFromStripe(stripe, email);

    console.log(`Found ${subscriptions.length} active subscriptions`);
    subscriptions.forEach(sub => {
      console.log(`- Product ID: ${sub.product_id}, Status: ${sub.status}`);
    });

    const accessCheck = findAllowedSubscription(subscriptions);

    if (accessCheck.allowed && accessCheck.subscription) {
      console.log(`Access granted for product: ${accessCheck.subscription.product_id}`);
      return new Response(
        JSON.stringify({
          allowed: true,
          subscription_details: {
            customer_id: accessCheck.subscription.customer_id,
            subscription_id: accessCheck.subscription.subscription_id,
            status: accessCheck.subscription.status,
            product_id: accessCheck.subscription.product_id,
            product_title: accessCheck.subscription.product_title,
            current_period_end: accessCheck.subscription.current_period_end,
            billing_interval: accessCheck.subscription.billing_interval,
          },
        } as SubscriptionCheckResponse),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Access denied - no matching product IDs found`);
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