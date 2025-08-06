import { supabase } from '@/integrations/supabase/client';

// Accounting types and interfaces
export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  category: AccountCategory;
  parent_id?: string;
  is_active: boolean;
  balance: number;
  description?: string;
  tax_line?: string;
  created_at: string;
  updated_at: string;
}

export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  REVENUE = 'revenue',
  EXPENSE = 'expense'
}

export enum AccountCategory {
  // Assets
  CURRENT_ASSET = 'current_asset',
  FIXED_ASSET = 'fixed_asset',
  OTHER_ASSET = 'other_asset',
  
  // Liabilities
  CURRENT_LIABILITY = 'current_liability',
  LONG_TERM_LIABILITY = 'long_term_liability',
  
  // Equity
  OWNERS_EQUITY = 'owners_equity',
  RETAINED_EARNINGS = 'retained_earnings',
  
  // Revenue
  OPERATING_REVENUE = 'operating_revenue',
  NON_OPERATING_REVENUE = 'non_operating_revenue',
  
  // Expenses
  COST_OF_GOODS_SOLD = 'cost_of_goods_sold',
  OPERATING_EXPENSE = 'operating_expense',
  NON_OPERATING_EXPENSE = 'non_operating_expense'
}

export interface JournalEntry {
  id: string;
  entry_number: string;
  date: string;
  description: string;
  reference?: string;
  total_debit: number;
  total_credit: number;
  is_posted: boolean;
  created_by: string;
  created_at: string;
  posted_at?: string;
  lines: JournalEntryLine[];
}

export interface JournalEntryLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  account_code: string;
  account_name: string;
  description?: string;
  debit_amount: number;
  credit_amount: number;
  line_number: number;
}

export interface TrialBalance {
  account_id: string;
  account_code: string;
  account_name: string;
  account_type: AccountType;
  debit_balance: number;
  credit_balance: number;
  net_balance: number;
}

export interface BalanceSheet {
  as_of_date: string;
  assets: {
    current_assets: BalanceSheetItem[];
    fixed_assets: BalanceSheetItem[];
    other_assets: BalanceSheetItem[];
    total_assets: number;
  };
  liabilities: {
    current_liabilities: BalanceSheetItem[];
    long_term_liabilities: BalanceSheetItem[];
    total_liabilities: number;
  };
  equity: {
    equity_accounts: BalanceSheetItem[];
    total_equity: number;
  };
}

export interface BalanceSheetItem {
  account_id: string;
  account_name: string;
  balance: number;
}

export interface IncomeStatement {
  start_date: string;
  end_date: string;
  revenue: {
    operating_revenue: IncomeStatementItem[];
    non_operating_revenue: IncomeStatementItem[];
    total_revenue: number;
  };
  cost_of_goods_sold: {
    cogs_items: IncomeStatementItem[];
    total_cogs: number;
  };
  gross_profit: number;
  expenses: {
    operating_expenses: IncomeStatementItem[];
    non_operating_expenses: IncomeStatementItem[];
    total_expenses: number;
  };
  net_income: number;
}

export interface IncomeStatementItem {
  account_id: string;
  account_name: string;
  amount: number;
}

export interface CashFlowStatement {
  start_date: string;
  end_date: string;
  operating_activities: CashFlowItem[];
  investing_activities: CashFlowItem[];
  financing_activities: CashFlowItem[];
  net_cash_flow: number;
  beginning_cash: number;
  ending_cash: number;
}

export interface CashFlowItem {
  description: string;
  amount: number;
}

class AccountingService {
  // Chart of Accounts Management
  async createAccount(account: Omit<ChartOfAccount, 'id' | 'created_at' | 'updated_at'>): Promise<ChartOfAccount> {
    // Validate account structure
    await this.validateAccountStructure(account);
    
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .insert({
        ...account,
        balance: 0
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create account: ${error.message}`);
    return data;
  }

  async updateAccount(id: string, updates: Partial<ChartOfAccount>): Promise<ChartOfAccount> {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update account: ${error.message}`);
    return data;
  }

  async getChartOfAccounts(): Promise<ChartOfAccount[]> {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('is_active', true)
      .order('code');

    if (error) throw new Error(`Failed to fetch chart of accounts: ${error.message}`);
    return data || [];
  }

  async getAccountsByType(type: AccountType): Promise<ChartOfAccount[]> {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .order('code');

    if (error) throw new Error(`Failed to fetch accounts by type: ${error.message}`);
    return data || [];
  }

  // Journal Entry Management
  async createJournalEntry(entry: Omit<JournalEntry, 'id' | 'entry_number' | 'created_at' | 'is_posted'>): Promise<JournalEntry> {
    // Validate double-entry balancing
    this.validateJournalEntry(entry);

    // Generate entry number
    const entryNumber = await this.generateEntryNumber();

    const { data: journalEntry, error: entryError } = await supabase
      .from('journal_entries')
      .insert({
        entry_number: entryNumber,
        date: entry.date,
        description: entry.description,
        reference: entry.reference,
        total_debit: entry.total_debit,
        total_credit: entry.total_credit,
        is_posted: false,
        created_by: entry.created_by
      })
      .select()
      .single();

    if (entryError) throw new Error(`Failed to create journal entry: ${entryError.message}`);

    // Create journal entry lines
    const lines = entry.lines.map((line, index) => ({
      journal_entry_id: journalEntry.id,
      account_id: line.account_id,
      account_code: line.account_code,
      account_name: line.account_name,
      description: line.description,
      debit_amount: line.debit_amount,
      credit_amount: line.credit_amount,
      line_number: index + 1
    }));

    const { data: entryLines, error: linesError } = await supabase
      .from('journal_entry_lines')
      .insert(lines)
      .select();

    if (linesError) throw new Error(`Failed to create journal entry lines: ${linesError.message}`);

    return {
      ...journalEntry,
      lines: entryLines
    };
  }

  async postJournalEntry(entryId: string): Promise<void> {
    // Get journal entry with lines
    const { data: entry, error: entryError } = await supabase
      .from('journal_entries')
      .select(`
        *,
        journal_entry_lines (*)
      `)
      .eq('id', entryId)
      .single();

    if (entryError) throw new Error(`Failed to fetch journal entry: ${entryError.message}`);
    if (!entry) throw new Error('Journal entry not found');
    if (entry.is_posted) throw new Error('Journal entry is already posted');

    // Update account balances
    for (const line of entry.journal_entry_lines) {
      await this.updateAccountBalance(line.account_id, line.debit_amount, line.credit_amount);
    }

    // Mark entry as posted
    const { error: postError } = await supabase
      .from('journal_entries')
      .update({
        is_posted: true,
        posted_at: new Date().toISOString()
      })
      .eq('id', entryId);

    if (postError) throw new Error(`Failed to post journal entry: ${postError.message}`);
  }

  async getJournalEntries(filters?: {
    startDate?: string;
    endDate?: string;
    accountId?: string;
    isPosted?: boolean;
  }): Promise<JournalEntry[]> {
    let query = supabase
      .from('journal_entries')
      .select(`
        *,
        journal_entry_lines (*)
      `)
      .order('date', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }
    if (filters?.isPosted !== undefined) {
      query = query.eq('is_posted', filters.isPosted);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch journal entries: ${error.message}`);
    
    return data || [];
  }

  // Financial Reports
  async generateTrialBalance(asOfDate?: string): Promise<TrialBalance[]> {
    const cutoffDate = asOfDate || new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .rpc('generate_trial_balance', {
        cutoff_date: cutoffDate
      });

    if (error) throw new Error(`Failed to generate trial balance: ${error.message}`);
    return data || [];
  }

  async generateBalanceSheet(asOfDate?: string): Promise<BalanceSheet> {
    const cutoffDate = asOfDate || new Date().toISOString().split('T')[0];
    const accounts = await this.getChartOfAccounts();
    const trialBalance = await this.generateTrialBalance(cutoffDate);

    // Group accounts by type and category
    const assets = this.groupAccountsByCategory(trialBalance, accounts, [
      AccountCategory.CURRENT_ASSET,
      AccountCategory.FIXED_ASSET,
      AccountCategory.OTHER_ASSET
    ]);

    const liabilities = this.groupAccountsByCategory(trialBalance, accounts, [
      AccountCategory.CURRENT_LIABILITY,
      AccountCategory.LONG_TERM_LIABILITY
    ]);

    const equity = this.groupAccountsByCategory(trialBalance, accounts, [
      AccountCategory.OWNERS_EQUITY,
      AccountCategory.RETAINED_EARNINGS
    ]);

    return {
      as_of_date: cutoffDate,
      assets: {
        current_assets: assets.current_asset || [],
        fixed_assets: assets.fixed_asset || [],
        other_assets: assets.other_asset || [],
        total_assets: this.calculateTotalBalance(Object.values(assets).flat())
      },
      liabilities: {
        current_liabilities: liabilities.current_liability || [],
        long_term_liabilities: liabilities.long_term_liability || [],
        total_liabilities: this.calculateTotalBalance(Object.values(liabilities).flat())
      },
      equity: {
        equity_accounts: Object.values(equity).flat(),
        total_equity: this.calculateTotalBalance(Object.values(equity).flat())
      }
    };
  }

  async generateIncomeStatement(startDate: string, endDate: string): Promise<IncomeStatement> {
    const { data, error } = await supabase
      .rpc('generate_income_statement', {
        start_date: startDate,
        end_date: endDate
      });

    if (error) throw new Error(`Failed to generate income statement: ${error.message}`);

    const accounts = await this.getChartOfAccounts();
    const accountMap = new Map(accounts.map(acc => [acc.id, acc]));

    // Group and calculate totals
    const revenue = this.groupIncomeStatementItems(data, accountMap, [
      AccountCategory.OPERATING_REVENUE,
      AccountCategory.NON_OPERATING_REVENUE
    ]);

    const cogs = this.groupIncomeStatementItems(data, accountMap, [
      AccountCategory.COST_OF_GOODS_SOLD
    ]);

    const expenses = this.groupIncomeStatementItems(data, accountMap, [
      AccountCategory.OPERATING_EXPENSE,
      AccountCategory.NON_OPERATING_EXPENSE
    ]);

    const totalRevenue = this.calculateTotalAmount(Object.values(revenue).flat());
    const totalCogs = this.calculateTotalAmount(Object.values(cogs).flat());
    const totalExpenses = this.calculateTotalAmount(Object.values(expenses).flat());

    return {
      start_date: startDate,
      end_date: endDate,
      revenue: {
        operating_revenue: revenue.operating_revenue || [],
        non_operating_revenue: revenue.non_operating_revenue || [],
        total_revenue: totalRevenue
      },
      cost_of_goods_sold: {
        cogs_items: Object.values(cogs).flat(),
        total_cogs: totalCogs
      },
      gross_profit: totalRevenue - totalCogs,
      expenses: {
        operating_expenses: expenses.operating_expense || [],
        non_operating_expenses: expenses.non_operating_expense || [],
        total_expenses: totalExpenses
      },
      net_income: totalRevenue - totalCogs - totalExpenses
    };
  }

  async generateCashFlowStatement(startDate: string, endDate: string): Promise<CashFlowStatement> {
    // This is a simplified cash flow statement
    // In practice, you'd need to analyze cash movements in detail
    const { data: cashTransactions, error } = await supabase
      .from('journal_entry_lines')
      .select(`
        *,
        journal_entries!inner (
          date,
          is_posted
        ),
        chart_of_accounts!inner (
          name,
          category
        )
      `)
      .eq('journal_entries.is_posted', true)
      .gte('journal_entries.date', startDate)
      .lte('journal_entries.date', endDate)
      .or('account_code.like.1000,account_code.like.1010', { foreignTable: 'chart_of_accounts' }); // Cash accounts

    if (error) throw new Error(`Failed to generate cash flow statement: ${error.message}`);

    // Get beginning and ending cash balances
    const beginningCash = await this.getCashBalance(startDate);
    const endingCash = await this.getCashBalance(endDate);

    // Categorize cash flows (simplified)
    const operatingActivities: CashFlowItem[] = [
      { description: 'Net Income', amount: 0 }, // Would be calculated from income statement
      { description: 'Depreciation', amount: 0 },
      { description: 'Changes in Working Capital', amount: 0 }
    ];

    const investingActivities: CashFlowItem[] = [
      { description: 'Equipment Purchases', amount: 0 },
      { description: 'Asset Sales', amount: 0 }
    ];

    const financingActivities: CashFlowItem[] = [
      { description: 'Loan Proceeds', amount: 0 },
      { description: 'Loan Payments', amount: 0 },
      { description: 'Owner Distributions', amount: 0 }
    ];

    return {
      start_date: startDate,
      end_date: endDate,
      operating_activities: operatingActivities,
      investing_activities: investingActivities,
      financing_activities: financingActivities,
      net_cash_flow: endingCash - beginningCash,
      beginning_cash: beginningCash,
      ending_cash: endingCash
    };
  }

  // Bank Reconciliation
  async performBankReconciliation(accountId: string, statementDate: string, statementBalance: number): Promise<{
    bookBalance: number;
    statementBalance: number;
    outstandingDeposits: number;
    outstandingChecks: number;
    adjustments: number;
    reconciledBalance: number;
    isReconciled: boolean;
  }> {
    // Get book balance
    const { data: account } = await supabase
      .from('chart_of_accounts')
      .select('balance')
      .eq('id', accountId)
      .single();

    const bookBalance = account?.balance || 0;

    // Get outstanding items (this would be more complex in practice)
    const outstandingDeposits = 0; // Calculate from uncleared deposits
    const outstandingChecks = 0; // Calculate from uncleared checks
    const adjustments = 0; // Bank fees, interest, etc.

    const reconciledBalance = statementBalance + outstandingDeposits - outstandingChecks + adjustments;
    const isReconciled = Math.abs(reconciledBalance - bookBalance) < 0.01; // Within 1 cent

    return {
      bookBalance,
      statementBalance,
      outstandingDeposits,
      outstandingChecks,
      adjustments,
      reconciledBalance,
      isReconciled
    };
  }

  // Utility methods
  private validateJournalEntry(entry: unknown): void {
    if (Math.abs(entry.total_debit - entry.total_credit) > 0.01) {
      throw new Error('Journal entry must balance: debits must equal credits');
    }

    if (!entry.lines || entry.lines.length < 2) {
      throw new Error('Journal entry must have at least two lines');
    }

    const calculatedDebit = entry.lines.reduce((sum: number, line: unknown) => sum + (line.debit_amount || 0), 0);
    const calculatedCredit = entry.lines.reduce((sum: number, line: unknown) => sum + (line.credit_amount || 0), 0);

    if (Math.abs(calculatedDebit - entry.total_debit) > 0.01 || Math.abs(calculatedCredit - entry.total_credit) > 0.01) {
      throw new Error('Journal entry totals do not match line item totals');
    }
  }

  private async validateAccountStructure(account: unknown): Promise<void> {
    // Validate account code uniqueness
    const { data: existing } = await supabase
      .from('chart_of_accounts')
      .select('id')
      .eq('code', account.code)
      .single();

    if (existing) {
      throw new Error(`Account code ${account.code} already exists`);
    }

    // Validate parent-child relationships
    if (account.parent_id) {
      const { data: parent } = await supabase
        .from('chart_of_accounts')
        .select('type')
        .eq('id', account.parent_id)
        .single();

      if (!parent) {
        throw new Error('Parent account does not exist');
      }

      if (parent.type !== account.type) {
        throw new Error('Child account type must match parent account type');
      }
    }
  }

  private async generateEntryNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const { data } = await supabase
      .from('journal_entries')
      .select('entry_number')
      .like('entry_number', `JE${year}%`)
      .order('entry_number', { ascending: false })
      .limit(1)
      .single();

    if (data?.entry_number) {
      const lastNumber = parseInt(data.entry_number.slice(-4));
      return `JE${year}${String(lastNumber + 1).padStart(4, '0')}`;
    } else {
      return `JE${year}0001`;
    }
  }

  private async updateAccountBalance(accountId: string, debitAmount: number, creditAmount: number): Promise<void> {
    const { data: account } = await supabase
      .from('chart_of_accounts')
      .select('balance, type')
      .eq('id', accountId)
      .single();

    if (!account) throw new Error('Account not found');

    let newBalance = account.balance;

    // Apply normal balance rules
    switch (account.type) {
      case AccountType.ASSET:
      case AccountType.EXPENSE:
        newBalance += debitAmount - creditAmount;
        break;
      case AccountType.LIABILITY:
      case AccountType.EQUITY:
      case AccountType.REVENUE:
        newBalance += creditAmount - debitAmount;
        break;
    }

    await supabase
      .from('chart_of_accounts')
      .update({ balance: newBalance })
      .eq('id', accountId);
  }

  private groupAccountsByCategory(
    trialBalance: TrialBalance[],
    accounts: ChartOfAccount[],
    categories: AccountCategory[]
  ): Record<string, BalanceSheetItem[]> {
    const result: Record<string, BalanceSheetItem[]> = {};
    const accountMap = new Map(accounts.map(acc => [acc.id, acc]));

    for (const category of categories) {
      result[category] = trialBalance
        .filter(tb => {
          const account = accountMap.get(tb.account_id);
          return account?.category === category;
        })
        .map(tb => ({
          account_id: tb.account_id,
          account_name: tb.account_name,
          balance: tb.net_balance
        }));
    }

    return result;
  }

  private groupIncomeStatementItems(
    data: unknown[],
    accountMap: Map<string, ChartOfAccount>,
    categories: AccountCategory[]
  ): Record<string, IncomeStatementItem[]> {
    const result: Record<string, IncomeStatementItem[]> = {};

    for (const category of categories) {
      result[category] = data
        .filter(item => {
          const account = accountMap.get(item.account_id);
          return account?.category === category;
        })
        .map(item => ({
          account_id: item.account_id,
          account_name: item.account_name,
          amount: item.amount || 0
        }));
    }

    return result;
  }

  private calculateTotalBalance(items: BalanceSheetItem[]): number {
    return items.reduce((total, item) => total + item.balance, 0);
  }

  private calculateTotalAmount(items: IncomeStatementItem[]): number {
    return items.reduce((total, item) => total + item.amount, 0);
  }

  private async getCashBalance(date: string): Promise<number> {
    const { data } = await supabase
      .from('chart_of_accounts')
      .select('balance')
      .in('code', ['1000', '1010']) // Cash account codes
      .lte('created_at', date);

    return data?.reduce((total, acc) => total + acc.balance, 0) || 0;
  }

  // Standard chart of accounts setup
  async setupStandardChartOfAccounts(): Promise<void> {
    const standardAccounts: Omit<ChartOfAccount, 'id' | 'created_at' | 'updated_at' | 'balance'>[] = [
      // Assets
      { code: '1000', name: 'Cash - Operating', type: AccountType.ASSET, category: AccountCategory.CURRENT_ASSET, is_active: true },
      { code: '1010', name: 'Cash - Savings', type: AccountType.ASSET, category: AccountCategory.CURRENT_ASSET, is_active: true },
      { code: '1200', name: 'Accounts Receivable', type: AccountType.ASSET, category: AccountCategory.CURRENT_ASSET, is_active: true },
      { code: '1300', name: 'Inventory', type: AccountType.ASSET, category: AccountCategory.CURRENT_ASSET, is_active: true },
      { code: '1500', name: 'Equipment', type: AccountType.ASSET, category: AccountCategory.FIXED_ASSET, is_active: true },
      { code: '1510', name: 'Accumulated Depreciation - Equipment', type: AccountType.ASSET, category: AccountCategory.FIXED_ASSET, is_active: true },
      
      // Liabilities
      { code: '2000', name: 'Accounts Payable', type: AccountType.LIABILITY, category: AccountCategory.CURRENT_LIABILITY, is_active: true },
      { code: '2100', name: 'Accrued Expenses', type: AccountType.LIABILITY, category: AccountCategory.CURRENT_LIABILITY, is_active: true },
      { code: '2500', name: 'Long-term Debt', type: AccountType.LIABILITY, category: AccountCategory.LONG_TERM_LIABILITY, is_active: true },
      
      // Equity
      { code: '3000', name: 'Owner\'s Equity', type: AccountType.EQUITY, category: AccountCategory.OWNERS_EQUITY, is_active: true },
      { code: '3900', name: 'Retained Earnings', type: AccountType.EQUITY, category: AccountCategory.RETAINED_EARNINGS, is_active: true },
      
      // Revenue
      { code: '4000', name: 'Service Revenue', type: AccountType.REVENUE, category: AccountCategory.OPERATING_REVENUE, is_active: true },
      { code: '4100', name: 'Product Sales', type: AccountType.REVENUE, category: AccountCategory.OPERATING_REVENUE, is_active: true },
      
      // Expenses
      { code: '5000', name: 'Cost of Goods Sold', type: AccountType.EXPENSE, category: AccountCategory.COST_OF_GOODS_SOLD, is_active: true },
      { code: '6000', name: 'Wages and Salaries', type: AccountType.EXPENSE, category: AccountCategory.OPERATING_EXPENSE, is_active: true },
      { code: '6100', name: 'Rent Expense', type: AccountType.EXPENSE, category: AccountCategory.OPERATING_EXPENSE, is_active: true },
      { code: '6200', name: 'Office Supplies', type: AccountType.EXPENSE, category: AccountCategory.OPERATING_EXPENSE, is_active: true },
      { code: '6300', name: 'Depreciation Expense', type: AccountType.EXPENSE, category: AccountCategory.OPERATING_EXPENSE, is_active: true },
    ];

    for (const account of standardAccounts) {
      try {
        await this.createAccount(account);
      } catch (error) {
        console.warn(`Account ${account.code} may already exist:`, error);
      }
    }
  }
}

// Export singleton instance
export const accountingService = new AccountingService();

// React hook for accounting functionality
export function useAccounting() {
  const [accounts, setAccounts] = React.useState<ChartOfAccount[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await accountingService.getChartOfAccounts();
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const createAccount = async (account: Omit<ChartOfAccount, 'id' | 'created_at' | 'updated_at' | 'balance'>) => {
    try {
      const newAccount = await accountingService.createAccount(account);
      setAccounts(prev => [...prev, newAccount]);
      return newAccount;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create account');
    }
  };

  const createJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'entry_number' | 'created_at' | 'is_posted'>) => {
    try {
      return await accountingService.createJournalEntry(entry);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create journal entry');
    }
  };

  const generateTrialBalance = async (asOfDate?: string) => {
    try {
      return await accountingService.generateTrialBalance(asOfDate);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to generate trial balance');
    }
  };

  const generateBalanceSheet = async (asOfDate?: string) => {
    try {
      return await accountingService.generateBalanceSheet(asOfDate);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to generate balance sheet');
    }
  };

  const generateIncomeStatement = async (startDate: string, endDate: string) => {
    try {
      return await accountingService.generateIncomeStatement(startDate, endDate);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to generate income statement');
    }
  };

  return {
    accounts,
    isLoading,
    error,
    loadAccounts,
    createAccount,
    createJournalEntry,
    generateTrialBalance,
    generateBalanceSheet,
    generateIncomeStatement,
    service: accountingService
  };
}

import React from 'react';