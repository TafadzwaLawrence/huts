'use client'

import { useState } from 'react'
import { CheckCircle, Download, FileText, DollarSign, Percent, TrendingUp, Users, Star } from 'lucide-react'

export function CommissionCalculatorWidget() {
  const [salePrice, setSalePrice] = useState<number>(250000)
  const [commissionRate, setCommissionRate] = useState<number>(5)
  const [agentSplit, setAgentSplit] = useState<number>(50)
  const [showProposalPreview, setShowProposalPreview] = useState(false)
  const [generatedProposal, setGeneratedProposal] = useState('')

  // Calculations
  const totalCommission = (salePrice * commissionRate) / 100
  const agentCommission = (totalCommission * agentSplit) / 100
  const brokerageCommission = totalCommission - agentCommission

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZW', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleGenerateProposal = () => {
    const proposal = `PROFESSIONAL LISTING PROPOSAL
Generated: ${new Date().toLocaleDateString()}

PROPERTY DETAILS
Estimated Value: ${formatCurrency(salePrice)}
Commission Structure: ${commissionRate}% of sale price
Total Commission: ${formatCurrency(totalCommission)}
Agent Split: ${agentSplit}% (${formatCurrency(agentCommission)})
Brokerage Split: ${100 - agentSplit}% (${formatCurrency(brokerageCommission)})

MARKETING PLAN INCLUDES:
• Professional photography & virtual tour
• Featured placement on Huts.co.zw
• Social media advertising campaign
• Email marketing to qualified buyers
• Open house coordination
• Negotiation & contract management

WHY CHOOSE ME:
• Local market expertise in Zimbabwe
• Proven track record of successful sales
• Extensive buyer database
• Professional negotiation skills
• Full-service transaction management

Terms: Exclusive listing agreement for 90 days.
Commission payable at closing from sale proceeds.

Ready to get started? Let's schedule your listing consultation.

---
This proposal was generated using Huts Agent Toolkit
Download your customizable template at huts.co.zw/tools
`
    setGeneratedProposal(proposal)
    setShowProposalPreview(true)
  }

  const handleDownloadProposal = () => {
    const element = document.createElement('a')
    const file = new Blob([generatedProposal], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `listing-proposal-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleDownloadTemplate = () => {
    // Download a more comprehensive template package info
    const templateContent = `HUTS AGENT TOOLKIT - TEMPLATE PACKAGE

This package includes templates for:
1. Listing Presentation Slides (PowerPoint)
2. Client Proposal Document (Word)
3. Comparative Market Analysis Worksheet (Excel)
4. Marketing Plan Template (PDF)
5. Lead Tracking Sheet (Excel)
6. Client Contract Checklist

To access the complete editable templates:
1. Visit https://huts.co.zw/agent-toolkit
2. Create your free agent account
3. Download all templates in editable formats

Premium templates include:
- Professional branding options
- Zimbabwe-specific clauses
- Commission agreement templates
- Buyer representation agreements

Get instant access: huts.co.zw/agent-toolkit
`
    const element = document.createElement('a')
    const file = new Blob([templateContent], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `huts-template-guide.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="rounded-lg border border-[#E9ECEF] bg-white p-6 shadow-sm">
      <div className="text-center mb-6">
        <div className="text-2xl font-bold text-[#212529] mb-2">Commission Calculator</div>
        <p className="text-xs text-[#ADB5BD]">Real-time calculations • Adjust any field</p>
      </div>

      {/* Calculator Inputs */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-[#212529] mb-1.5">
            <DollarSign className="h-3.5 w-3.5" />
            Property Sale Price
          </label>
          <input
            type="number"
            value={salePrice}
            onChange={(e) => setSalePrice(Number(e.target.value))}
            className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm focus:border-[#212529] focus:outline-none focus:ring-1 focus:ring-[#212529]"
            placeholder="Enter property price"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-[#212529] mb-1.5">
            <Percent className="h-3.5 w-3.5" />
            Commission Rate (%)
          </label>
          <input
            type="number"
            step="0.5"
            value={commissionRate}
            onChange={(e) => setCommissionRate(Number(e.target.value))}
            className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm focus:border-[#212529] focus:outline-none focus:ring-1 focus:ring-[#212529]"
            placeholder="e.g., 5"
          />
          <p className="text-[10px] text-[#ADB5BD] mt-1">Standard rates in Zimbabwe: 3-7%</p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-[#212529] mb-1.5">
            <Users className="h-3.5 w-3.5" />
            Your Split (%)
          </label>
          <input
            type="number"
            step="5"
            value={agentSplit}
            onChange={(e) => setAgentSplit(Number(e.target.value))}
            className="w-full rounded-lg border border-[#E9ECEF] px-3 py-2 text-sm focus:border-[#212529] focus:outline-none focus:ring-1 focus:ring-[#212529]"
            placeholder="e.g., 50"
          />
          <p className="text-[10px] text-[#ADB5BD] mt-1">Typical agent splits: 40-70% depending on brokerage</p>
        </div>
      </div>

      {/* Results Display */}
      <div className="bg-[#F8F9FA] rounded-lg p-4 mb-6 space-y-2">
        <div className="flex justify-between items-center border-b border-[#E9ECEF] pb-2">
          <span className="text-xs text-[#495057]">Total Commission:</span>
          <span className="text-sm font-bold text-[#212529]">{formatCurrency(totalCommission)}</span>
        </div>
        <div className="flex justify-between items-center border-b border-[#E9ECEF] pb-2">
          <span className="text-xs text-[#495057]">Your Commission ({agentSplit}%):</span>
          <span className="text-sm font-bold text-[#212529]">{formatCurrency(agentCommission)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#495057]">Brokerage Share:</span>
          <span className="text-sm text-[#6C757D]">{formatCurrency(brokerageCommission)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 mb-4">
        <button
          onClick={handleGenerateProposal}
          className="w-full bg-[#212529] text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#495057] transition-colors flex items-center justify-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Generate Proposal
        </button>
        <button
          onClick={handleDownloadTemplate}
          className="w-full border border-[#212529] text-[#212529] bg-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#F8F9FA] transition-colors flex items-center justify-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Template Package
        </button>
      </div>

      {/* Proposal Preview Modal */}
      {showProposalPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowProposalPreview(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-[#E9ECEF]">
              <h3 className="font-bold text-[#212529]">Proposal Preview</h3>
              <button onClick={() => setShowProposalPreview(false)} className="text-[#ADB5BD] hover:text-[#212529]">✕</button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-xs whitespace-pre-wrap font-mono bg-[#F8F9FA] p-4 rounded-lg">
                {generatedProposal}
              </pre>
            </div>
            <div className="p-4 border-t border-[#E9ECEF] flex gap-3">
              <button
                onClick={handleDownloadProposal}
                className="flex-1 bg-[#212529] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#495057] transition-colors"
              >
                Download as Text
              </button>
              <button
                onClick={() => setShowProposalPreview(false)}
                className="flex-1 border border-[#E9ECEF] text-[#495057] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#F8F9FA] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-[10px] text-center text-[#ADB5BD] mt-4">
        Generate client-ready proposals with your calculated figures.<br />
        All templates are customizable for your brand.
      </p>
    </div>
  )
}
