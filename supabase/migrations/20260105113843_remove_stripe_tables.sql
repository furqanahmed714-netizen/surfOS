/*
  # Remove Stripe Database Tables

  This migration removes all Stripe-related database tables, views, and types
  that are not needed for the subscription validation flow.

  ## Changes
  1. Drop views: stripe_user_subscriptions, stripe_user_orders
  2. Drop tables: stripe_orders, stripe_subscriptions, stripe_customers
  3. Drop enum types: stripe_order_status, stripe_subscription_status

  ## Notes
  - Subscription validation is now handled entirely through the Edge Function
  - No database storage is needed for Stripe data
  - All checks are performed against Stripe API directly
*/

DROP VIEW IF EXISTS stripe_user_orders;
DROP VIEW IF EXISTS stripe_user_subscriptions;

DROP TABLE IF EXISTS stripe_orders;
DROP TABLE IF EXISTS stripe_subscriptions;
DROP TABLE IF EXISTS stripe_customers;

DROP TYPE IF EXISTS stripe_order_status;
DROP TYPE IF EXISTS stripe_subscription_status;
