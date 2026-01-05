import React from 'react';
import { stripeProducts } from '../stripe-config';
import { ProductCard } from '../components/stripe/ProductCard';

export function ProductsPage() {
  const subscriptionProducts = stripeProducts.filter(p => p.mode === 'subscription');
  const oneTimeProducts = stripeProducts.filter(p => p.mode === 'payment');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Products</h1>
          <p className="text-xl text-gray-600">Choose the plan that works best for you</p>
        </div>

        {subscriptionProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Subscription Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subscriptionProducts.map((product) => (
                <ProductCard key={product.priceId} product={product} />
              ))}
            </div>
          </div>
        )}

        {oneTimeProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">One-Time Purchases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {oneTimeProducts.map((product) => (
                <ProductCard key={product.priceId} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}