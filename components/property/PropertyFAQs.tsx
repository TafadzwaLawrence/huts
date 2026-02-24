'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface FAQ {
  question: string
  answer: string
}

interface PropertyFAQsProps {
  propertyName?: string
  walkScore?: number
  petsAllowed?: boolean
  hasInUnitLaundry?: boolean
  virtualTourAvailable?: boolean
}

export default function PropertyFAQs({
  propertyName,
  walkScore,
  petsAllowed,
  hasInUnitLaundry,
  virtualTourAvailable,
}: PropertyFAQsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  // Auto-generate FAQs based on property features
  const faqs: FAQ[] = []

  if (walkScore !== undefined) {
    const walkability = walkScore >= 70 ? "very walkable" : walkScore >= 50 ? "somewhat walkable" : "car-dependent"
    faqs.push({
      question: `What is the walk score of ${propertyName || 'this property'}?`,
      answer: `${propertyName || 'This property'} has a walk score of ${walkScore}, it's ${walkability}.`,
    })
  }

  if (petsAllowed !== undefined) {
    faqs.push({
      question: `What are ${propertyName || "this property"}'s policies on pets?`,
      answer: petsAllowed
        ? `Pets are allowed at ${propertyName || 'this property'}. Check the pet policy section above for specific restrictions and fees.`
        : `${propertyName || 'This property'} does not allow pets.`,
    })
  }

  if (hasInUnitLaundry !== undefined) {
    faqs.push({
      question: `Does ${propertyName || 'this property'} have in-unit laundry?`,
      answer: hasInUnitLaundry
        ? `Yes, ${propertyName || 'this property'} has in-unit laundry available.`
        : `No, ${propertyName || 'this property'} does not have in-unit laundry. Check with the property manager for laundry facilities.`,
    })
  }

  if (virtualTourAvailable) {
    faqs.push({
      question: `Does ${propertyName || 'this property'} have virtual tours available?`,
      answer: `Yes, 3D and virtual tours are available for ${propertyName || 'this property'}.`,
    })
  }

  // Default FAQs
  faqs.push({
    question: 'How do I schedule a viewing?',
    answer: 'Contact the property manager using the contact form or phone number above to schedule a viewing at your convenience.',
  })

  faqs.push({
    question: 'What documents do I need to apply?',
    answer: 'Typically you\'ll need: valid ID, proof of income (pay stubs, bank statements), employment verification, and references. Contact the property for specific requirements.',
  })

  if (faqs.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-base font-bold text-[#212529] mb-4">Frequently asked questions</h2>
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-[#E9ECEF] rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F8F9FA] transition-colors"
            >
              <span className="text-sm font-semibold text-[#212529]">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp size={16} className="text-[#495057] flex-shrink-0 ml-2" />
              ) : (
                <ChevronDown size={16} className="text-[#495057] flex-shrink-0 ml-2" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-4 pb-3 pt-1">
                <p className="text-sm text-[#495057] leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
