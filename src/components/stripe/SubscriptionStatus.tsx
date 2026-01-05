import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { stripeProducts } from '../../stripe-config';

interface SubscriptionData {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
}

export function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status, price_id, current_period_end, cancel_at_period_end')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!subscription || subscription.subscription_status === 'not_started') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Subscription Status</h3>
        <p className="text-gray-600">No active subscription</p>
      </div>
    );
  }

  const product = stripeProducts.find(p => p.priceId === subscription.price_id);
  const productName = product ? product.name : 'Unknown Plan';

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'past_due':
        return 'text-yellow-600 bg-yellow-100';
      case 'canceled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Status</h3>
      
      <div className="space-y-3">
        <div>
          <span className="text-sm font-medium text-gray-500">Plan:</span>
          <p className="text-gray-900">{productName}</p>
        </div>
        
        <div>
          <span className="text-sm font-medium text-gray-500">Status:</span>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ml-2 ${getStatusColor(subscription.subscription_status)}`}>
            {subscription.subscription_status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        
        {subscription.current_period_end && (
          <div>
            <span className="text-sm font-medium text-gray-500">
              {subscription.cancel_at_period_end ? 'Expires:' : 'Next billing:'}
            </span>
            <p className="text-gray-900">{formatDate(subscription.current_period_end)}</p>
          </div>
        )}
        
        {subscription.cancel_at_period_end && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-yellow-800 text-sm">
              Your subscription will not renew and will end on {formatDate(subscription.current_period_end!)}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}