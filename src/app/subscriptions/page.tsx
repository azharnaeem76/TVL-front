'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import { getCurrentUser } from '@/lib/api';

const PLANS = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    features: [
      'Basic case law search',
      'Limited AI chat (5/day)',
      'Legal news',
      'Study topics access',
      'Community support',
    ],
    limits: ['No document analysis', 'No AI tools', 'Limited search results'],
    color: 'border-gray-500/20',
    btnClass: 'bg-gray-500/10 text-gray-400',
  },
  {
    name: 'Pro',
    price: 2000,
    period: '/month',
    features: [
      'Unlimited case law search',
      'Unlimited AI chat',
      'All AI tools access',
      'Document analysis (20/month)',
      'Case tracker & client CRM',
      'Citation finder',
      'Priority support',
      'Exam preparation',
    ],
    limits: ['Single user only'],
    color: 'border-brass-400/30',
    btnClass: 'bg-brass-400/20 text-brass-300',
    popular: true,
  },
  {
    name: 'Firm',
    price: 8000,
    period: '/month',
    features: [
      'Everything in Pro',
      'Team workspaces (up to 10)',
      'Unlimited document analysis',
      'Internal messaging',
      'Consultation booking',
      'Payment integration',
      'Audit logs',
      'Custom branding',
      'Dedicated support',
    ],
    limits: [],
    color: 'border-indigo-400/30',
    btnClass: 'bg-indigo-500/20 text-indigo-300',
  },
];

export default function SubscriptionsPage() {
  const [currentPlan] = useState('Free');
  const { showToast } = useToast();

  const handleSelect = (plan: string) => {
    if (plan === currentPlan) return;
    showToast(`Subscription management requires payment integration. Contact admin to upgrade to ${plan}.`, 'info');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-navy-950 pt-20 px-4 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-display font-bold text-white">Subscription Plans</h1>
            <p className="text-gray-400 mt-2">Choose the plan that fits your legal practice</p>
            <p className="text-sm text-brass-400 mt-1">Current plan: <span className="font-semibold">{currentPlan}</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(plan => (
              <div key={plan.name} className={`relative bg-white/[0.03] border ${plan.color} rounded-xl p-6 ${plan.popular ? 'ring-1 ring-brass-400/30' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-brass-400/20 text-brass-300 text-xs rounded-full">Most Popular</div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <div className="mt-3">
                    {plan.price === 0 ? (
                      <span className="text-3xl font-bold text-gray-300">Free</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-white">Rs. {plan.price.toLocaleString()}</span>
                        <span className="text-gray-400 text-sm">{plan.period}</span>
                      </>
                    )}
                  </div>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-300">
                      <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                  {plan.limits.map((l, i) => (
                    <li key={`l${i}`} className="flex gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      {l}
                    </li>
                  ))}
                </ul>

                <button onClick={() => handleSelect(plan.name)}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${currentPlan === plan.name ? 'bg-white/[0.06] text-gray-500 cursor-default' : `${plan.btnClass} hover:opacity-80`}`}>
                  {currentPlan === plan.name ? 'Current Plan' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-gray-500 text-sm">All prices in Pakistani Rupees (PKR). Plans can be paid via JazzCash, Easypaisa, or bank transfer.</p>
            <p className="text-gray-600 text-xs mt-2">Contact admin@tvl.pk for enterprise pricing and custom plans.</p>
          </div>
        </div>
      </div>
    </>
  );
}
