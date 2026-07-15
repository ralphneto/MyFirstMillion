export type GoalType = 'FirstMillion' | 'Retirement' | 'EmergencyFund' | 'RealEstate' | 'Travel' | 'Education' | 'Vehicle' | 'Custom';

export interface FinancialGoal {
  id: number;
  name: string;
  type: GoalType;
  targetAmount: number;
  initialAmount: number;
  monthlyContribution: number;
  expectedReturnRate: number;
  targetDate: string;
  description?: string;
  color: string;
  icon: string;
  isAchieved: boolean;
  achievedAt?: string;
  createdAt: string;
  currentAmount: number;
  progressPercent: number;
}

export interface GoalProjection {
  goalId: number;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  expectedReturnRate: number;
  estimatedCompletionDate?: string;
  monthsToGoal?: number;
  progressPercent: number;
  projections: MonthlyProjectionPoint[];
}

export interface MonthlyProjectionPoint {
  month: number;
  date: string;
  projectedAmount: number;
}

export interface InvestmentSuggestions {
  profile: string;
  expectedAnnualReturn: number;
  suggestions: InvestmentOption[];
}

export interface InvestmentOption {
  name: string;
  allocation: number;
  expectedReturn: number;
  risk: string;
  description: string;
}
