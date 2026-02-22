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
        <p className="text-[#495057]">Manage your subscription and payment methods</p>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-xl border-2 border-[#E9ECEF] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-[#F8F9FA] flex items-center justify-center">
              <Building2 className="h-6 w-6 text-[#495057]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-[#212529]">Starter Plan</h2>
                <span className="px-2 py-0.5 bg-[#E9ECEF] text-[#495057] text-xs font-medium rounded-full">
                  Current
                </span>
              </div>
              <p className="text-sm text-[#495057]">Free forever - 3 property listings</p>
            </div>
          </div>
          <div className="text-right">
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
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            billingCycle === 'yearly' ? 'bg-[#212529]' : 'bg-[#E9ECEF]'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-[#212529]' : 'text-[#ADB5BD]'}`}>
          Yearly
          <span className="ml-1 text-[#51CF66] text-xs">Save 20%</span>
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
              className={`relative bg-white rounded-xl border-2 p-6 transition-all ${
                plan.popular
                  ? 'border-[#212529] shadow-lg'
                  : 'border-[#E9ECEF] hover:border-[#ADB5BD]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#212529] text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  plan.popular ? 'bg-[#212529]' : 'bg-[#F8F9FA]'
                }`}>
                  <plan.icon className={`h-5 w-5 ${plan.popular ? 'text-white' : 'text-[#495057]'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#212529]">{plan.name}</h3>
                  <p className="text-xs text-[#495057]">{plan.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-[#212529]">${price}</span>
                <span className="text-[#495057]">/{plan.period === 'forever' ? 'forever' : 'mo'}</span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#495057]">
                    <Check className="h-4 w-4 text-[#51CF66] flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled={isCurrentPlan}
                className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  isCurrentPlan
                    ? 'bg-[#E9ECEF] text-[#ADB5BD] cursor-not-allowed'
                    : plan.popular
                    ? 'bg-[#212529] text-white hover:bg-black'
                    : 'border-2 border-[#212529] text-[#212529] hover:bg-[#212529] hover:text-white'
                }`}
              >
                {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
                {!isCurrentPlan && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          )
        })}
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-xl border-2 border-[#E9ECEF] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#F8F9FA] flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-[#495057]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#212529]">Payment Method</h2>
              <p className="text-sm text-[#495057]">Manage your payment details</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-[#ADB5BD]" />
            <span className="text-[#495057]">No payment method on file</span>
          </div>
          <button className="text-[#212529] font-medium hover:underline">
            Add Card
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-xl border-2 border-[#E9ECEF] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#F8F9FA] flex items-center justify-center">
              <Receipt className="h-5 w-5 text-[#495057]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#212529]">Billing History</h2>
              <p className="text-sm text-[#495057]">View past invoices and receipts</p>
            </div>
          </div>
        </div>

        <div className="text-center py-8 text-[#495057]">
          <Calendar className="h-12 w-12 mx-auto mb-3 text-[#E9ECEF]" />
          <p>No billing history yet</p>
          <p className="text-sm">Your invoices will appear here</p>
        </div>
      </div>
    </div>
  )
}
