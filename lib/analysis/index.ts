// Property Analysis Module Exports
// Comprehensive analytics for Huts rental/sales platform

export { 
  getPropertyEngagement, 
  getEngagementBenchmark,
  type EngagementMetrics,
  type ViewStats 
} from './engagement'

export { 
  getMarketAnalysis, 
  getPriceTrends,
  type MarketAnalysis,
  type ComparableProperty 
} from './market'

export { 
  calculateListingQuality, 
  getBatchQualityScores,
  type QualityScore,
  type QualityBreakdown 
} from './quality'

export { 
  calculateInvestmentMetrics, 
  compareInvestments,
  calculateAmortizationSchedule,
  type InvestmentMetrics,
  type ExpenseBreakdown,
  type InvestmentParams 
} from './investment'

// Convenience type for combined analysis
export interface PropertyAnalysis {
  engagement: EngagementMetrics
  market: MarketAnalysis
  quality: QualityScore
  investment?: InvestmentMetrics // Only for sale properties
}

import type { EngagementMetrics } from './engagement'
import type { MarketAnalysis } from './market'
import type { QualityScore } from './quality'
import type { InvestmentMetrics } from './investment'
