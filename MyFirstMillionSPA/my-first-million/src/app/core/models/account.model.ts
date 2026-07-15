export type AccountType = 'Checking' | 'Savings' | 'Investment' | 'Cash' | 'CreditCard' | 'Other';

export interface Account {
  id: number;
  name: string;
  type: AccountType;
  balance: number;
  initialBalance: number;
  currency: string;
  bankName?: string;
  color: string;
  icon: string;
  isActive: boolean;
  includeInTotal: boolean;
}
