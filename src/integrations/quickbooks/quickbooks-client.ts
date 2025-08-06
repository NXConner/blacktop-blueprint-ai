import { supabase } from '@/integrations/supabase/client';

// QuickBooks API configuration
interface QuickBooksConfig {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'production';
  redirectUri: string;
  scope: string[];
}

interface QuickBooksToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  x_refresh_token_expires_in: number;
  realmId: string;
}

interface QuickBooksCustomer {
  Id: string;
  Name: string;
  CompanyName?: string;
  Email?: string;
  Phone?: string;
  BillAddr?: QuickBooksAddress;
  ShipAddr?: QuickBooksAddress;
  Balance: number;
  Active: boolean;
}

interface QuickBooksAddress {
  Line1?: string;
  Line2?: string;
  City?: string;
  Country?: string;
  CountrySubDivisionCode?: string;
  PostalCode?: string;
}

interface QuickBooksItem {
  Id: string;
  Name: string;
  Description?: string;
  UnitPrice: number;
  Type: 'Inventory' | 'NonInventory' | 'Service';
  IncomeAccountRef?: { value: string; name: string };
  ExpenseAccountRef?: { value: string; name: string };
  Active: boolean;
}

interface QuickBooksInvoice {
  Id: string;
  CustomerRef: { value: string; name: string };
  TxnDate: string;
  DueDate?: string;
  TotalAmt: number;
  Balance: number;
  Line: QuickBooksInvoiceLine[];
  DocNumber?: string;
  PrivateNote?: string;
}

interface QuickBooksInvoiceLine {
  Id?: string;
  LineNum?: number;
  Amount: number;
  DetailType: 'SalesItemLineDetail';
  SalesItemLineDetail: {
    ItemRef: { value: string; name: string };
    UnitPrice: number;
    Qty: number;
  };
}

interface QuickBooksExpense {
  Id: string;
  TxnDate: string;
  TotalAmt: number;
  AccountRef: { value: string; name: string };
  PaymentType: 'Cash' | 'Check' | 'CreditCard';
  Line: QuickBooksExpenseLine[];
  PrivateNote?: string;
}

interface QuickBooksExpenseLine {
  Id?: string;
  Amount: number;
  DetailType: 'AccountBasedExpenseLineDetail';
  AccountBasedExpenseLineDetail: {
    AccountRef: { value: string; name: string };
  };
}

class QuickBooksClient {
  private config: QuickBooksConfig;
  private token: QuickBooksToken | null = null;
  private baseUrl: string;

  constructor() {
    this.config = {
      clientId: process.env.QUICKBOOKS_CLIENT_ID || '',
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET || '',
      environment: (process.env.QUICKBOOKS_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      redirectUri: process.env.QUICKBOOKS_REDIRECT_URI || 'http://localhost:3000/auth/quickbooks/callback',
      scope: ['com.intuit.quickbooks.accounting']
    };

    this.baseUrl = this.config.environment === 'sandbox' 
      ? 'https://sandbox-quickbooks.api.intuit.com' 
      : 'https://quickbooks.api.intuit.com';
  }

  // OAuth 2.0 Authorization
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      scope: this.config.scope.join(' '),
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      access_type: 'offline',
      state: crypto.randomUUID()
    });

    return `https://appcenter.intuit.com/connect/oauth2?${params.toString()}`;
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string, realmId: string): Promise<QuickBooksToken> {
    const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri
      })
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const tokenData = await response.json();
    this.token = { ...tokenData, realmId };

    // Store tokens securely in Supabase
    await this.storeTokens(this.token);

    return this.token;
  }

  // Refresh access token
  async refreshTokens(): Promise<QuickBooksToken> {
    if (!this.token?.refresh_token) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.token.refresh_token
      })
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const tokenData = await response.json();
    this.token = { ...this.token, ...tokenData };

    // Update stored tokens
    await this.storeTokens(this.token);

    return this.token;
  }

  // Store tokens securely
  private async storeTokens(token: QuickBooksToken): Promise<void> {
    await supabase
      .from('app_configs')
      .upsert({
        name: 'quickbooks_tokens',
        value: token,
        description: 'QuickBooks OAuth tokens',
        is_active: true
      });
  }

  // Load tokens from storage
  private async loadTokens(): Promise<QuickBooksToken | null> {
    if (this.token) return this.token;

    const { data } = await supabase
      .from('app_configs')
      .select('value')
      .eq('name', 'quickbooks_tokens')
      .eq('is_active', true)
      .single();

    if (data?.value) {
      this.token = data.value as QuickBooksToken;
    }

    return this.token;
  }

  // Make authenticated API request
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    await this.loadTokens();

    if (!this.token) {
      throw new Error('No QuickBooks authentication token available');
    }

    // Check if token needs refresh
    const now = Date.now();
    const tokenExpiry = now + (this.token.expires_in * 1000);
    if (now >= tokenExpiry) {
      await this.refreshTokens();
    }

    const url = `${this.baseUrl}/v3/company/${this.token.realmId}/${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token.access_token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`QuickBooks API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  }

  // Customer operations
  async getCustomers(): Promise<QuickBooksCustomer[]> {
    const response = await this.makeRequest("query?query=SELECT * FROM Customer MAXRESULTS 1000");
    return response.QueryResponse?.Customer || [];
  }

  async createCustomer(customer: Partial<QuickBooksCustomer>): Promise<QuickBooksCustomer> {
    const response = await this.makeRequest('customers', {
      method: 'POST',
      body: JSON.stringify({ Customer: customer })
    });
    return response.QueryResponse.Customer[0];
  }

  async updateCustomer(customer: QuickBooksCustomer): Promise<QuickBooksCustomer> {
    const response = await this.makeRequest('customers', {
      method: 'POST',
      body: JSON.stringify({ Customer: customer })
    });
    return response.QueryResponse.Customer[0];
  }

  // Item operations
  async getItems(): Promise<QuickBooksItem[]> {
    const response = await this.makeRequest("query?query=SELECT * FROM Item MAXRESULTS 1000");
    return response.QueryResponse?.Item || [];
  }

  async createItem(item: Partial<QuickBooksItem>): Promise<QuickBooksItem> {
    const response = await this.makeRequest('items', {
      method: 'POST',
      body: JSON.stringify({ Item: item })
    });
    return response.QueryResponse.Item[0];
  }

  // Invoice operations
  async getInvoices(): Promise<QuickBooksInvoice[]> {
    const response = await this.makeRequest("query?query=SELECT * FROM Invoice MAXRESULTS 1000");
    return response.QueryResponse?.Invoice || [];
  }

  async createInvoice(invoice: Partial<QuickBooksInvoice>): Promise<QuickBooksInvoice> {
    const response = await this.makeRequest('invoices', {
      method: 'POST',
      body: JSON.stringify({ Invoice: invoice })
    });
    return response.QueryResponse.Invoice[0];
  }

  async updateInvoice(invoice: QuickBooksInvoice): Promise<QuickBooksInvoice> {
    const response = await this.makeRequest('invoices', {
      method: 'POST',
      body: JSON.stringify({ Invoice: invoice })
    });
    return response.QueryResponse.Invoice[0];
  }

  // Expense operations
  async getExpenses(): Promise<QuickBooksExpense[]> {
    const response = await this.makeRequest("query?query=SELECT * FROM Purchase MAXRESULTS 1000");
    return response.QueryResponse?.Purchase || [];
  }

  async createExpense(expense: Partial<QuickBooksExpense>): Promise<QuickBooksExpense> {
    const response = await this.makeRequest('purchases', {
      method: 'POST',
      body: JSON.stringify({ Purchase: expense })
    });
    return response.QueryResponse.Purchase[0];
  }

  // Chart of Accounts
  async getAccounts(): Promise<any[]> {
    const response = await this.makeRequest("query?query=SELECT * FROM Account MAXRESULTS 1000");
    return response.QueryResponse?.Account || [];
  }

  // Financial Reports
  async getProfitAndLossReport(startDate: string, endDate: string): Promise<any> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      summarize_column_by: 'Month'
    });
    
    return this.makeRequest(`reports/ProfitAndLoss?${params.toString()}`);
  }

  async getBalanceSheetReport(asOfDate: string): Promise<any> {
    const params = new URLSearchParams({
      as_of_date: asOfDate
    });
    
    return this.makeRequest(`reports/BalanceSheet?${params.toString()}`);
  }

  async getCashFlowReport(startDate: string, endDate: string): Promise<any> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate
    });
    
    return this.makeRequest(`reports/CashFlow?${params.toString()}`);
  }

  // Sync operations with local database
  async syncCustomersToLocal(): Promise<void> {
    const customers = await this.getCustomers();
    
    for (const customer of customers) {
      await supabase
        .from('quickbooks_customers')
        .upsert({
          qb_id: customer.Id,
          name: customer.Name,
          company_name: customer.CompanyName,
          email: customer.Email,
          phone: customer.Phone,
          balance: customer.Balance,
          active: customer.Active,
          bill_address: customer.BillAddr,
          ship_address: customer.ShipAddr,
          last_synced: new Date().toISOString()
        });
    }
  }

  async syncInvoicesToLocal(): Promise<void> {
    const invoices = await this.getInvoices();
    
    for (const invoice of invoices) {
      await supabase
        .from('quickbooks_invoices')
        .upsert({
          qb_id: invoice.Id,
          customer_id: invoice.CustomerRef.value,
          customer_name: invoice.CustomerRef.name,
          txn_date: invoice.TxnDate,
          due_date: invoice.DueDate,
          total_amount: invoice.TotalAmt,
          balance: invoice.Balance,
          doc_number: invoice.DocNumber,
          private_note: invoice.PrivateNote,
          line_items: invoice.Line,
          last_synced: new Date().toISOString()
        });
    }
  }

  async syncExpensesToLocal(): Promise<void> {
    const expenses = await this.getExpenses();
    
    for (const expense of expenses) {
      await supabase
        .from('quickbooks_expenses')
        .upsert({
          qb_id: expense.Id,
          txn_date: expense.TxnDate,
          total_amount: expense.TotalAmt,
          account_id: expense.AccountRef.value,
          account_name: expense.AccountRef.name,
          payment_type: expense.PaymentType,
          private_note: expense.PrivateNote,
          line_items: expense.Line,
          last_synced: new Date().toISOString()
        });
    }
  }

  // Full data synchronization
  async performFullSync(): Promise<{ success: boolean; message: string; details: unknown }> {
    try {
      const startTime = Date.now();
      
      await Promise.all([
        this.syncCustomersToLocal(),
        this.syncInvoicesToLocal(),
        this.syncExpensesToLocal()
      ]);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Log sync operation
      await supabase
        .from('sync_logs')
        .insert({
          integration: 'quickbooks',
          sync_type: 'full',
          status: 'success',
          duration_ms: duration,
          details: { message: 'Full sync completed successfully' },
          created_at: new Date().toISOString()
        });

      return {
        success: true,
        message: 'QuickBooks sync completed successfully',
        details: { duration, syncedAt: new Date().toISOString() }
      };
    } catch (error) {
      // Log sync error
      await supabase
        .from('sync_logs')
        .insert({
          integration: 'quickbooks',
          sync_type: 'full',
          status: 'error',
          error_message: error.message,
          details: { error: error.toString() },
          created_at: new Date().toISOString()
        });

      return {
        success: false,
        message: `QuickBooks sync failed: ${error.message}`,
        details: { error: error.toString() }
      };
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('companyinfo/1');
      return true;
    } catch {
      return false;
    }
  }

  // Get connection status
  async getConnectionStatus(): Promise<{
    connected: boolean;
    lastSync?: string;
    tokenExpiry?: string;
    realmId?: string;
  }> {
    await this.loadTokens();
    
    if (!this.token) {
      return { connected: false };
    }

    const connected = await this.testConnection();
    const tokenExpiry = new Date(Date.now() + (this.token.expires_in * 1000)).toISOString();

    // Get last sync time
    const { data: lastSync } = await supabase
      .from('sync_logs')
      .select('created_at')
      .eq('integration', 'quickbooks')
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return {
      connected,
      lastSync: lastSync?.created_at,
      tokenExpiry,
      realmId: this.token.realmId
    };
  }
}

// Export singleton instance
export const quickBooksClient = new QuickBooksClient();

// React hook for QuickBooks integration
export function useQuickBooks() {
  const [isConnected, setIsConnected] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [connectionStatus, setConnectionStatus] = React.useState(null);

  React.useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const status = await quickBooksClient.getConnectionStatus();
      setConnectionStatus(status);
      setIsConnected(status.connected);
    } catch (error) {
      console.error('Error checking QuickBooks connection:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const connect = async () => {
    const authUrl = quickBooksClient.getAuthUrl();
    window.location.href = authUrl;
  };

  const sync = async () => {
    setIsLoading(true);
    try {
      const result = await quickBooksClient.performFullSync();
      await checkConnection(); // Refresh status
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isConnected,
    isLoading,
    connectionStatus,
    connect,
    sync,
    checkConnection,
    client: quickBooksClient
  };
}

import React from 'react';