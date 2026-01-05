export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1RP9l4FaryYd4gFH2IYnoNUP',
    name: 'AZ AI Syndicate Board Member Payment Plan',
    description: 'AZ AI Syndicate - Board Member Payment Plan',
    mode: 'subscription',
    price: 800.00,
    currency: 'usd',
  },
  {
    priceId: 'price_1N0tTSFaryYd4gFHWSB7hoq6',
    name: 'Midjourney – 50 Tokens',
    description: 'Midjourney – 50 Tokens',
    mode: 'payment',
    price: 40.00,
    currency: 'usd',
  },
  {
    priceId: 'price_1N0tT4FaryYd4gFHuKxfLhOV',
    name: 'Midjourney – 20 Tokens',
    description: 'Midjourney – 20 Tokens',
    mode: 'payment',
    price: 20.00,
    currency: 'usd',
  },
  {
    priceId: 'price_1N0tSnFaryYd4gFH1dZCQQuC',
    name: 'Midjourney – 10 Tokens',
    description: 'Midjourney – 10 Tokens',
    mode: 'payment',
    price: 15.00,
    currency: 'usd',
  },
];