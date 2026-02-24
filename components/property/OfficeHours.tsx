'use client'

import { Clock, Phone, Globe, Mail } from 'lucide-react'

interface OfficeHoursProps {
  propertyManagerName?: string
  propertyManagerCompany?: string
  propertyManagerPhone?: string
  propertyManagerEmail?: string
  propertyManagerWebsite?: string
  officeHours?: {
    mon?: string
    tue?: string
    wed?: string
    thu?: string
    fri?: string
    sat?: string
    sun?: string
  }
}

const DAY_LABELS: Record<string, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
}

export default function OfficeHours({
  propertyManagerName,
  propertyManagerCompany,
  propertyManagerPhone,
  propertyManagerEmail,
  propertyManagerWebsite,
  officeHours,
}: OfficeHoursProps) {
  if (!propertyManagerName && !propertyManagerCompany && !officeHours) {
    return null
  }

  return (
    <div className="bg-white border border-[#E9ECEF] rounded-xl p-5 mb-8">
      {/* Property Manager Info */}
      {(propertyManagerName || propertyManagerCompany) && (
        <div className="mb-4">
          {propertyManagerCompany && (
            <p className="text-base font-bold text-[#212529]">{propertyManagerCompany}</p>
          )}
          {propertyManagerName && (
            <p className="text-sm text-[#495057] mt-1">Managed by {propertyManagerName}</p>
          )}
        </div>
      )}

      {/* Office Hours */}
      {officeHours && Object.keys(officeHours).length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-[#495057]" />
            <p className="text-sm font-semibold text-[#212529]">Office hours</p>
          </div>
          <div className="space-y-1.5">
            {Object.entries(officeHours).map(([day, hours]) => (
              <div key={day} className="flex justify-between text-sm">
                <span className="text-[#495057]">{DAY_LABELS[day] || day}:</span>
                <span className="text-[#212529] font-medium">{hours}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Info */}
      {(propertyManagerPhone || propertyManagerEmail || propertyManagerWebsite) && (
        <div className="pt-4 border-t border-[#E9ECEF] space-y-2.5">
          {propertyManagerPhone && (
            <a
              href={`tel:${propertyManagerPhone}`}
              className="flex items-center gap-2 text-sm text-[#495057] hover:text-[#212529] transition-colors"
            >
              <Phone size={14} />
              <span>{propertyManagerPhone}</span>
            </a>
          )}
          {propertyManagerEmail && (
            <a
              href={`mailto:${propertyManagerEmail}`}
              className="flex items-center gap-2 text-sm text-[#495057] hover:text-[#212529] transition-colors"
            >
              <Mail size={14} />
              <span>{propertyManagerEmail}</span>
            </a>
          )}
          {propertyManagerWebsite && (
            <a
              href={propertyManagerWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#495057] hover:text-[#212529] transition-colors"
            >
              <Globe size={14} />
              <span>Visit website</span>
            </a>
          )}
        </div>
      )}
    </div>
  )
}
