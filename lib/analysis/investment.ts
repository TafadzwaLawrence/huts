import { createClient } from '@/lib/supabase/server'

export interface ExpenseBreakdown {
  propertyTax: number
  insurance: number
  maintenance: number
  vacancy: number
  hoa: number
  total: number
}

export interface InvestmentMetrics {
  salePrice: number
  estimatedMonthlyRent: number
  annualGrossIncome: number
  estimatedExpenses: ExpenseBreakdown
  netOperatingIncome: number
  
  // Key investment ratios
  capRate: number
  grossRentMultiplier: number
  pricePerUnit: number
  
  // Financing metrics
  financing: {
    downPayment: number
    loanAmount: number
    monthlyMortgage: number
    totalMonthlyPayment: number
  }
  
  // Cash flow
  monthlyNetCashFlow: number
  annualCashFlow: number
  cashOnCashReturn: number
  
  // Break-even
  breakEvenOccupancy: number
  monthsToBreakEven: number
  
  // Recommendation
  recommendation: 'strong-buy' | 'buy' | 'hold' | 'avoid'
  analysis: string
}

export interface InvestmentParams {
  downPaymentPercent?: number
  interestRate?: number
  termYears?: number
  expectedVacancyRate?: number
}

const DEFAULT_PARAMS: Required<InvestmentParams> = {
  downPaymentPercent: 20,
  interestRate: 6.5,
  termYears: 30,
  expectedVacancyRate: 5
}

/**
 * Calculate comprehensive investment metrics for a sale property
 */
export async function calculateInvestmentMetrics(
  propertyId: string,
  params: InvestmentParams = {}
): Promise<InvestmentMetrics> {
  const supabase = await createClient()
  const config = { ...DEFAULT_PARAMS, ...params }

  // Get property
  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single()

  if (error || !property) throw new Error('Property not found')
  if (property.listing_type !== 'sale') throw new Error('Property is not for sale')

  const salePrice = property.sale_price

  // Estimate monthly rent from comparable rentals
  const { data: rentComps } = await supabase
    .from('properties')
    .select('price, beds, baths, sqft')
    .eq('city', property.city)
    .eq('listing_type', 'rent')
    .eq('status', 'active')
    .gte('beds', Math.max(0, property.beds - 1))
    .lte('beds', property.beds + 1)
    .limit(15)

  let estimatedMonthlyRent: number
  if (rentComps && rentComps.length >= 3) {
    // Calculate weighted average based on similarity
    const weights = rentComps.map(r => {
      let weight = 1
      if (r.beds === property.beds) weight += 0.5
      if (Math.abs(r.baths - property.baths) <= 0.5) weight += 0.3
      if (r.sqft && property.sqft && Math.abs(r.sqft - property.sqft) / property.sqft < 0.2) {
        weight += 0.5
      }
      return { rent: r.price, weight }
    })

    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0)
    estimatedMonthlyRent = Math.round(
      weights.reduce((sum, w) => sum + w.rent * w.weight, 0) / totalWeight
    )
  } else {
    // Fallback: 0.5-0.8% of purchase price rule
    estimatedMonthlyRent = Math.round(salePrice * 0.006)
  }

  // Annual gross income
  const annualGross = estimatedMonthlyRent * 12

  // Calculate expenses
  const expenses: ExpenseBreakdown = {
    propertyTax: property.property_tax_annual || Math.round(salePrice * 0.01),
    insurance: Math.round(salePrice * 0.003),
    maintenance: Math.round(annualGross * 0.08),
    vacancy: Math.round(annualGross * (config.expectedVacancyRate / 100)),
    hoa: (property.hoa_fee_monthly || 0) * 12,
    total: 0
  }
  expenses.total = Object.values(expenses).reduce((sum, v) => sum + v, 0) - expenses.total

  // Net Operating Income
  const noi = annualGross - expenses.total

  // Key ratios
  const capRate = (noi / salePrice) * 100
  const grossRentMultiplier = salePrice / annualGross
  const pricePerUnit = salePrice // For single-family; would divide by units for multi-family

  // Financing calculations
  const downPayment = Math.round(salePrice * (config.downPaymentPercent / 100))
  const loanAmount = salePrice - downPayment
  const monthlyRate = config.interestRate / 100 / 12
  const numPayments = config.termYears * 12

  let monthlyMortgage: number
  if (monthlyRate > 0) {
    monthlyMortgage = Math.round(
      loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1)
    )
  } else {
    monthlyMortgage = Math.round(loanAmount / numPayments)
  }

  // Total monthly payment (mortgage + taxes/insurance/HOA)
  const monthlyExpenses = Math.round(expenses.total / 12)
  const totalMonthlyPayment = monthlyMortgage + monthlyExpenses

  // Cash flow
  const monthlyNetCashFlow = estimatedMonthlyRent - totalMonthlyPayment
  const annualCashFlow = monthlyNetCashFlow * 12
  const cashOnCashReturn = downPayment > 0 ? (annualCashFlow / downPayment) * 100 : 0

  // Break-even calculations
  const breakEvenOccupancy = totalMonthlyPayment > 0
    ? Math.round((totalMonthlyPayment / estimatedMonthlyRent) * 100)
    : 0
  
  const monthsToBreakEven = annualCashFlow > 0
    ? Math.round(downPayment / (annualCashFlow / 12))
    : 999

  // Generate recommendation
  const { recommendation, analysis } = generateRecommendation({
    capRate,
    cashOnCashReturn,
    grossRentMultiplier,
    monthlyNetCashFlow,
    breakEvenOccupancy
  })

  return {
    salePrice,
    estimatedMonthlyRent,
    annualGrossIncome: annualGross,
    estimatedExpenses: expenses,
    netOperatingIncome: noi,
    capRate: round(capRate, 2),
    grossRentMultiplier: round(grossRentMultiplier, 2),
    pricePerUnit,
    financing: {
      downPayment,
      loanAmount,
      monthlyMortgage,
      totalMonthlyPayment
    },
    monthlyNetCashFlow,
    annualCashFlow,
    cashOnCashReturn: round(cashOnCashReturn, 2),
    breakEvenOccupancy: Math.min(100, breakEvenOccupancy),
    monthsToBreakEven: Math.min(999, monthsToBreakEven),
    recommendation,
    analysis
  }
}

/**
 * Generate investment recommendation
 */
function generateRecommendation(metrics: {
  capRate: number
  cashOnCashReturn: number
  grossRentMultiplier: number
  monthlyNetCashFlow: number
  breakEvenOccupancy: number
}): { recommendation: InvestmentMetrics['recommendation']; analysis: string } {
  let score = 0
  const reasons: string[] = []

  // Cap rate scoring
  if (metrics.capRate >= 8) {
    score += 3
    reasons.push('Excellent cap rate')
  } else if (metrics.capRate >= 6) {
    score += 2
    reasons.push('Good cap rate')
  } else if (metrics.capRate >= 4) {
    score += 1
    reasons.push('Moderate cap rate')
  } else {
    reasons.push('Low cap rate')
  }

  // Cash on cash scoring
  if (metrics.cashOnCashReturn >= 12) {
    score += 3
    reasons.push('Strong cash-on-cash return')
  } else if (metrics.cashOnCashReturn >= 8) {
    score += 2
    reasons.push('Good cash returns')
  } else if (metrics.cashOnCashReturn >= 4) {
    score += 1
  } else if (metrics.cashOnCashReturn < 0) {
    score -= 2
    reasons.push('Negative cash flow')
  }

  // GRM scoring (lower is better)
  if (metrics.grossRentMultiplier <= 12) {
    score += 2
    reasons.push('Favorable price-to-rent ratio')
  } else if (metrics.grossRentMultiplier <= 15) {
    score += 1
  } else if (metrics.grossRentMultiplier > 20) {
    score -= 1
    reasons.push('High price relative to rent potential')
  }

  // Cash flow scoring
  if (metrics.monthlyNetCashFlow > 300) {
    score += 2
    reasons.push('Positive monthly cash flow')
  } else if (metrics.monthlyNetCashFlow > 0) {
    score += 1
  }

  // Break-even scoring
  if (metrics.breakEvenOccupancy > 95) {
    score -= 2
    reasons.push('High occupancy required to break even')
  }

  // Determine recommendation
  let recommendation: InvestmentMetrics['recommendation']
  if (score >= 8) {
    recommendation = 'strong-buy'
  } else if (score >= 5) {
    recommendation = 'buy'
  } else if (score >= 2) {
    recommendation = 'hold'
  } else {
    recommendation = 'avoid'
  }

  const analysis = reasons.slice(0, 3).join('. ') + '.'

  return { recommendation, analysis }
}

/**
 * Compare multiple properties for investment
 */
export async function compareInvestments(
  propertyIds: string[],
  params: InvestmentParams = {}
): Promise<Array<InvestmentMetrics & { propertyId: string; title: string }>> {
  const supabase = await createClient()

  const results = await Promise.all(
    propertyIds.map(async (id) => {
      try {
        const metrics = await calculateInvestmentMetrics(id, params)
        const { data: property } = await supabase
          .from('properties')
          .select('title')
          .eq('id', id)
          .single()

        return {
          propertyId: id,
          title: property?.title || 'Unknown',
          ...metrics
        }
      } catch (error) {
        return null
      }
    })
  )

  return results
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.cashOnCashReturn - a.cashOnCashReturn)
}

/**
 * Calculate mortgage amortization schedule
 */
export function calculateAmortizationSchedule(
  loanAmount: number,
  interestRate: number,
  termYears: number,
  months: number = 12
): Array<{
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
}> {
  const monthlyRate = interestRate / 100 / 12
  const numPayments = termYears * 12
  
  const monthlyPayment = monthlyRate > 0
    ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    : loanAmount / numPayments

  const schedule = []
  let balance = loanAmount

  for (let month = 1; month <= Math.min(months, numPayments); month++) {
    const interest = balance * monthlyRate
    const principal = monthlyPayment - interest
    balance -= principal

    schedule.push({
      month,
      payment: Math.round(monthlyPayment),
      principal: Math.round(principal),
      interest: Math.round(interest),
      balance: Math.round(Math.max(0, balance))
    })
  }

  return schedule
}

function round(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}
