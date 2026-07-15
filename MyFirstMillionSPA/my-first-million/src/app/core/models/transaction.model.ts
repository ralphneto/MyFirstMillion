export type TransactionType = 'Income' | 'Expense';
export type PaymentMethod = 'Cash' | 'DebitCard' | 'CreditCard' | 'BankTransfer' | 'Pix' | 'Boleto' | 'Other';

export interface Transaction {
  id: number;
  accountId: number;
  accountName: string;
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number;
  type: TransactionType;
  date: string;
  description: string;
  notes?: string;
  tags?: string;
  paymentMethod: PaymentMethod;
  installmentNumber?: number;
  totalInstallments?: number;
  createdAt: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
  topExpenseCategories: CategoryBreakdown[];
  topIncomeCategories: CategoryBreakdown[];
  monthlyFlow: MonthlyFlow[];
}

export interface CategoryBreakdown {
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number;
  percentage: number;
}

export interface MonthlyFlow {
  month: number;
  year: number;
  label: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface CreateTransactionRequest {
  accountId: number;
  categoryId: number;
  amount: number;
  type: TransactionType;
  date: string;
  description: string;
  notes?: string;
  tags?: string;
  paymentMethod: PaymentMethod;
  installmentNumber?: number;
  totalInstallments?: number;
}
