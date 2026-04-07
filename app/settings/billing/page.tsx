'use client'

import { useState } from 'react'
import { 
  CreditCard, 
  Check, 
  Zap, 
  Building2, 
  Crown,
  ArrowRight,
  Receipt,
  Calendar,
  AlertCircle
} from 'lucide-react'

const plans = [
  {
    id: 'free',
    name: 'Starter',
    price: 0,
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'List up to 3 properties',
      'Basic analytics',
      'Email support',
      'Standard listing visibility',
    ],
    icon: Building2,
    popular: false,
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 29,
    period: 'month',
    description: 'For serious landlords',
    features: [
      'Unlimited properties',
      'Advanced analytics',
      'Priority support',
      'Featured listings',
      'Lead management',
      'Custom branding',
    ],
    icon: Zap,
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    period: 'month',
    description: 'For property managers',
    features: [
      'Everything in Professional',
      'Team accounts',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'White-label options',
    ],
    icon: Crown,
    popular: false,
  },
]

export default function BillingPage() {
  const [currentPlan] = useState('free')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#212529]">Billing</h1>
        <p className="text-sm text-[#495057] mt-1">Manage your subscription and payment methods</p>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-lg border border-[#E9ECEF] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-[#F8F9FA] flex items-center justify-center">
              <Building2 size={20} className="text-[#495057]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-semibold text-[#212529]">Starter Plan</h2>
                <span className="px-2 py-0.5 bg-[#E9ECEF] text-[#495057] text-xs font-medium rounded-full">
                  Current
                </span>
              </div>
              <p className="text-sm text-[#495057]">Free forever - 3 property listings</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-2xl font-bold text-[#212529]">$0</p>
            <p className="text-sm text-[#495057]">per month</p>
          </div>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-[#212529]' : 'text-[#ADB5BD]'}`}>
          Monthly
        </span>
        <button
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1 ${
            billingCycle === 'yearly' ? 'bg-[#212529]' : 'bg-[#E9ECEF]'
          }`}
          aria-label="Toggle billing cycle"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-[#212529]' : 'text-[#ADB5BD]'}`}>
          Yearly
          <span className="ml-1 text-[#51CF66] text-xs font-semibold">Save 20%</span>
        </span>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan
          const price = billingCycle === 'yearly' ? Math.round(plan.price * 0.8) : plan.price
          
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg border p-6 transition-all ${
                plan.popular
                  ? 'border-[#212529] shadow-md'
                  : 'border-[#E9ECEF] hover:border-[#ADB5BD] shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#212529] text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  plan.popular ? 'bg-[#212529]' : 'bg-[#F8F9FA]'
                }`}>
                  <plan.icon size={18} className={plan.popular ? 'text-white' : 'text-[#495057]'} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#212529]">{plan.name}</h3>
                  <p className="text-xs text-[#495057]">{plan.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-[#212529]">${price}</span>
                <span className="text-[#495057] text-sm">/{plan.period === 'forever' ? 'forever' : 'mo'}</span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#495057]">
                    <Check size={14} className="text-[#51CF66] flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled={isCurrentPlan}
                className={`w-full py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  isCurrentPlan
                    ? 'bg-[#F8F9FA] text-[#ADB5BD] border border-[#E9ECEF] cursor-not-allowed'
                    : plan.popular
                    ? 'bg-[#212529] text-white hover:bg-black focus:ring-[#212529]'
                    : 'border border-[#212529] text-[#212529] hover:bg-[#212529] hover:text-white focus:ring-[#212529]'
                }`}
              >
                {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
                {!isCurrentPlan && <ArrowRight size={14} />}
              </button>
            </div>
          )
        })}
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-lg border border-[#E9ECEF] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-[#F8F9FA] flex items-center justify-center">
            <CreditCard size={18} className="text-[#495057]" />
          </div>
          <div>
            <h2 className="font-semibold text-[#212529]">Payment Method</h2>
            <p className="text-sm text-[#495057]">Manage your payment details</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-lg border border-[#E9ECEF]">
          <div className="flex items-center gap-3">
            <AlertCircle size={16} className="text-[#ADB5BD]" />
            <span className="text-sm text-[#495057]">No payment method on file</span>
          </div>
          <button className="text-sm font-semibold text-[#212529] hover:underline focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1 rounded">
            Add Card
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-lg border border-[#E9ECEF] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-[#F8F9FA] flex items-center justify-center">
            <Receipt size={18} className="text-[#495057]" />
          </div>
          <div>
            <h2 className="font-semibold text-[#212529]">Billing History</h2>
            <p className="text-sm text-[#495057]">View past invoices and receipts</p>
          </div>
        </div>

        <div className="text-center py-8">
          <Calendar size={48} className="mx-auto mb-3 text-[#E9ECEF]" />
          <p className="text-sm text-[#495057]">No billing history yet</p>
          <p className="text-xs text-[#ADB5BD] mt-1">Your invoices will appear here</p>
        </div>
      </div>
    </div>
  )
}