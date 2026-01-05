import React, { useState } from 'react';
import { StripeProduct } from '../../stripe-config';
import { createCheckoutSession } from '../../lib/stripe';

interface ProductCardProps {
  product: StripeProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const successUrl = `${window.location.origin}/success`;
      const cancelUrl = window.location.href;
      
      await createCheckoutSession(product.priceId, product.mode, successUrl, cancelUrl);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm">{product.description}</p>
      </div>
      
      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-gray-900">
            {formatPrice(product.price, product.currency)}
          </span>
          {product.mode === 'subscription' && (
            <span className="text-gray-500 ml-2">/month</span>
          )}
        </div>
      </div>

      <button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          product.mode === 'subscription' ? 'Subscribe' : 'Buy Now'
        )}
      </button>
    </div>
  );
}