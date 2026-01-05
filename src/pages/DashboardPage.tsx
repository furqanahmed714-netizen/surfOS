import React from 'react';
import { SubscriptionStatus } from '../components/stripe/SubscriptionStatus';

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your account and subscriptions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SubscriptionStatus />
          
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/products"
                className="block w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              >
                Browse Products
              </a>
              <a
                href="/games"
                className="block w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              >
                Play Games
              </a>
              <a
                href="/feedback"
                className="block w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              >
                Submit Feedback
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}