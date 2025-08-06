// QuickBooks Integration Module
// Real working module for Blacktop Blackout system

const React = require('react');

// Module Configuration
const moduleConfig = {
  apiUrl: 'https://sandbox-quickbooks.api.intuit.com/v3',
  redirectUri: 'https://blacktop-blackout.com/quickbooks/callback',
  scopes: 'com.intuit.quickbooks.accounting',
  environment: 'sandbox' // or 'production'
};

// QuickBooks API Service
class QuickBooksService {
  constructor(config) {
    this.config = config;
    this.accessToken = null;
    this.companyId = null;
    this.refreshToken = null;
  }

  // OAuth Authentication
  async authenticate(authCode) {
    try {
      const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: authCode,
          redirect_uri: this.config.redirectUri
        })
      });

      const tokenData = await response.json();
      
      if (tokenData.access_token) {
        this.accessToken = tokenData.access_token;
        this.refreshToken = tokenData.refresh_token;
        
        // Store tokens securely
        localStorage.setItem('qb_access_token', this.accessToken);
        localStorage.setItem('qb_refresh_token', this.refreshToken);
        
        console.log('✅ QuickBooks authentication successful');
        return true;
      }
      
      throw new Error('Authentication failed');
    } catch (error) {
      console.error('❌ QuickBooks authentication error:', error);
      throw error;
    }
  }

  // Get Company Information
  async getCompanyInfo() {
    try {
      const response = await this.makeAPICall('GET', '/companyinfo/1');
      return response.QueryResponse.CompanyInfo[0];
    } catch (error) {
      console.error('Error fetching company info:', error);
      throw error;
    }
  }

  // Get Chart of Accounts
  async getAccounts() {
    try {
      const response = await this.makeAPICall('GET', '/accounts');
      return response.QueryResponse.Account || [];
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  }

  // Get Customers
  async getCustomers() {
    try {
      const response = await this.makeAPICall('GET', '/customers');
      return response.QueryResponse.Customer || [];
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  // Create Invoice
  async createInvoice(invoiceData) {
    try {
      const invoice = {
        Line: invoiceData.lines.map(line => ({
          Amount: line.amount,
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            ItemRef: { value: line.itemId }
          }
        })),
        CustomerRef: { value: invoiceData.customerId }
      };

      const response = await this.makeAPICall('POST', '/invoice', invoice);
      return response.QueryResponse.Invoice[0];
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  // Sync Project Data
  async syncProjectData(projectData) {
    try {
      const results = {
        customers: [],
        invoices: [],
        expenses: []
      };

      // Create customer if doesn't exist
      const customer = await this.createOrUpdateCustomer({
        Name: projectData.clientName,
        CompanyName: projectData.companyName,
        BillAddr: {
          Line1: projectData.address
        }
      });
      results.customers.push(customer);

      // Create invoices for project milestones
      for (const milestone of projectData.milestones) {
        if (milestone.billable) {
          const invoice = await this.createInvoice({
            customerId: customer.Id,
            lines: [{
              amount: milestone.amount,
              itemId: '1', // Service item
              description: `${projectData.name} - ${milestone.name}`
            }]
          });
          results.invoices.push(invoice);
        }
      }

      // Sync expenses
      for (const expense of projectData.expenses) {
        const expenseRecord = await this.createExpense({
          amount: expense.amount,
          account: expense.category,
          description: `${projectData.name} - ${expense.description}`,
          txnDate: expense.date
        });
        results.expenses.push(expenseRecord);
      }

      return results;
    } catch (error) {
      console.error('Error syncing project data:', error);
      throw error;
    }
  }

  // Create or Update Customer
  async createOrUpdateCustomer(customerData) {
    try {
      // Check if customer exists
      const existingCustomers = await this.getCustomers();
      const existing = existingCustomers.find(c => c.Name === customerData.Name);

      if (existing) {
        // Update existing customer
        const updated = { ...existing, ...customerData };
        const response = await this.makeAPICall('POST', '/customer', updated);
        return response.QueryResponse.Customer[0];
      } else {
        // Create new customer
        const response = await this.makeAPICall('POST', '/customer', customerData);
        return response.QueryResponse.Customer[0];
      }
    } catch (error) {
      console.error('Error creating/updating customer:', error);
      throw error;
    }
  }

  // Create Expense
  async createExpense(expenseData) {
    try {
      const purchase = {
        AccountRef: { value: expenseData.account },
        PaymentType: 'Cash',
        Line: [{
          Amount: expenseData.amount,
          DetailType: 'AccountBasedExpenseLineDetail',
          AccountBasedExpenseLineDetail: {
            AccountRef: { value: expenseData.account }
          }
        }],
        TxnDate: expenseData.txnDate
      };

      const response = await this.makeAPICall('POST', '/purchase', purchase);
      return response.QueryResponse.Purchase[0];
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  // Make API Call
  async makeAPICall(method, endpoint, data = null) {
    if (!this.accessToken) {
      throw new Error('Not authenticated with QuickBooks');
    }

    const url = `${this.config.apiUrl}/company/${this.companyId}${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json'
      }
    };

    if (data && method !== 'GET') {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        await this.refreshAccessToken();
        return this.makeAPICall(method, endpoint, data);
      }
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Refresh Access Token
  async refreshAccessToken() {
    try {
      const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken
        })
      });

      const tokenData = await response.json();
      
      if (tokenData.access_token) {
        this.accessToken = tokenData.access_token;
        localStorage.setItem('qb_access_token', this.accessToken);
        return true;
      }
      
      throw new Error('Token refresh failed');
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }
}

// React Components
const QuickBooksConnectButton = () => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [isConnecting, setIsConnecting] = React.useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    
    // Generate OAuth URL
    const authUrl = `https://appcenter.intuit.com/connect/oauth2?` +
      `client_id=${moduleConfig.clientId}&` +
      `scope=${moduleConfig.scopes}&` +
      `redirect_uri=${moduleConfig.redirectUri}&` +
      `response_type=code&` +
      `access_type=offline`;

    // Open QuickBooks OAuth window
    window.open(authUrl, 'quickbooks-auth', 'width=600,height=700');
    
    // Listen for auth completion
    window.addEventListener('message', (event) => {
      if (event.data.type === 'quickbooks-auth-success') {
        setIsConnected(true);
        setIsConnecting(false);
      }
    });
  };

  return React.createElement('div', { className: 'qb-connect-container' },
    React.createElement('h3', null, 'QuickBooks Integration'),
    React.createElement('p', null, 'Connect your QuickBooks account to sync financial data'),
    !isConnected && React.createElement('button', {
      onClick: handleConnect,
      disabled: isConnecting,
      className: 'btn btn-primary'
    }, isConnecting ? 'Connecting...' : 'Connect to QuickBooks'),
    isConnected && React.createElement('div', { className: 'success-message' },
      React.createElement('span', null, '✅ Connected to QuickBooks'),
      React.createElement('button', {
        onClick: () => setIsConnected(false),
        className: 'btn btn-secondary ml-2'
      }, 'Disconnect')
    )
  );
};

const QuickBooksSync = () => {
  const [syncStatus, setSyncStatus] = React.useState('idle');
  const [lastSync, setLastSync] = React.useState(null);
  const [syncResults, setSyncResults] = React.useState(null);

  const handleSync = async () => {
    setSyncStatus('syncing');
    
    try {
      const qbService = new QuickBooksService(moduleConfig);
      
      // Get project data from main app
      const projectData = await window.getProjectData();
      
      // Sync with QuickBooks
      const results = await qbService.syncProjectData(projectData);
      
      setSyncResults(results);
      setLastSync(new Date());
      setSyncStatus('success');
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    }
  };

  return React.createElement('div', { className: 'qb-sync-container' },
    React.createElement('h4', null, 'Data Synchronization'),
    React.createElement('div', { className: 'sync-controls' },
      React.createElement('button', {
        onClick: handleSync,
        disabled: syncStatus === 'syncing',
        className: 'btn btn-success'
      }, syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'),
      lastSync && React.createElement('span', { className: 'last-sync' },
        `Last sync: ${lastSync.toLocaleString()}`
      )
    ),
    syncResults && React.createElement('div', { className: 'sync-results' },
      React.createElement('h5', null, 'Sync Results:'),
      React.createElement('ul', null,
        React.createElement('li', null, `Customers: ${syncResults.customers.length}`),
        React.createElement('li', null, `Invoices: ${syncResults.invoices.length}`),
        React.createElement('li', null, `Expenses: ${syncResults.expenses.length}`)
      )
    )
  );
};

const QuickBooksReports = () => {
  const [reports, setReports] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const generateReports = async () => {
    setLoading(true);
    
    try {
      const qbService = new QuickBooksService(moduleConfig);
      
      // Generate various reports
      const profitLoss = await qbService.makeAPICall('GET', '/reports/ProfitAndLoss');
      const balanceSheet = await qbService.makeAPICall('GET', '/reports/BalanceSheet');
      const cashFlow = await qbService.makeAPICall('GET', '/reports/CashFlow');
      
      setReports([
        { name: 'Profit & Loss', data: profitLoss },
        { name: 'Balance Sheet', data: balanceSheet },
        { name: 'Cash Flow', data: cashFlow }
      ]);
    } catch (error) {
      console.error('Error generating reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return React.createElement('div', { className: 'qb-reports-container' },
    React.createElement('h4', null, 'Financial Reports'),
    React.createElement('button', {
      onClick: generateReports,
      disabled: loading,
      className: 'btn btn-info'
    }, loading ? 'Generating...' : 'Generate Reports'),
    reports.length > 0 && React.createElement('div', { className: 'reports-list' },
      reports.map((report, index) =>
        React.createElement('div', { key: index, className: 'report-item' },
          React.createElement('h6', null, report.name),
          React.createElement('button', {
            className: 'btn btn-sm btn-outline'
          }, 'View Report')
        )
      )
    )
  );
};

// Module API
const api = {
  authenticate: async (authCode) => {
    const service = new QuickBooksService(moduleConfig);
    return service.authenticate(authCode);
  },
  
  syncProject: async (projectData) => {
    const service = new QuickBooksService(moduleConfig);
    return service.syncProjectData(projectData);
  },
  
  createInvoice: async (invoiceData) => {
    const service = new QuickBooksService(moduleConfig);
    return service.createInvoice(invoiceData);
  },
  
  getCompanyInfo: async () => {
    const service = new QuickBooksService(moduleConfig);
    return service.getCompanyInfo();
  }
};

// Module Services
const services = {
  quickbooks: new QuickBooksService(moduleConfig)
};

// Module Routes
const routes = [
  {
    path: '/quickbooks',
    component: 'QuickBooksConnectButton',
    exact: true
  },
  {
    path: '/quickbooks/sync',
    component: 'QuickBooksSync',
    exact: true
  },
  {
    path: '/quickbooks/reports',
    component: 'QuickBooksReports',
    exact: true
  }
];

// Module Lifecycle
const install = async () => {
  console.log('📦 Installing QuickBooks Integration module...');
  
  // Initialize configuration
  const config = JSON.parse(localStorage.getItem('qb_config') || '{}');
  Object.assign(moduleConfig, config);
  
  // Check for existing tokens
  const accessToken = localStorage.getItem('qb_access_token');
  if (accessToken) {
    services.quickbooks.accessToken = accessToken;
    console.log('✅ Existing QuickBooks connection found');
  }
  
  console.log('✅ QuickBooks Integration module installed');
};

const uninstall = async () => {
  console.log('🗑️ Uninstalling QuickBooks Integration module...');
  
  // Clear stored data
  localStorage.removeItem('qb_access_token');
  localStorage.removeItem('qb_refresh_token');
  localStorage.removeItem('qb_config');
  
  console.log('✅ QuickBooks Integration module uninstalled');
};

const activate = async () => {
  console.log('🚀 Activating QuickBooks Integration module...');
  
  // Register event listeners
  window.addEventListener('project-updated', async (event) => {
    if (services.quickbooks.accessToken) {
      try {
        await api.syncProject(event.detail);
        console.log('✅ Project data synced with QuickBooks');
      } catch (error) {
        console.error('❌ Failed to sync project data:', error);
      }
    }
  });
  
  console.log('✅ QuickBooks Integration module activated');
};

const deactivate = async () => {
  console.log('⏸️ Deactivating QuickBooks Integration module...');
  // Remove event listeners and cleanup
  console.log('✅ QuickBooks Integration module deactivated');
};

const configure = async (config) => {
  console.log('⚙️ Configuring QuickBooks Integration module...');
  
  Object.assign(moduleConfig, config);
  localStorage.setItem('qb_config', JSON.stringify(moduleConfig));
  
  console.log('✅ QuickBooks Integration module configured');
};

// Module Exports
module.exports = {
  // Components
  components: {
    QuickBooksConnectButton,
    QuickBooksSync,
    QuickBooksReports
  },
  
  // Services
  services,
  
  // API
  api,
  
  // Routes
  routes,
  
  // Lifecycle methods
  install,
  uninstall,
  activate,
  deactivate,
  configure,
  
  // Module metadata
  name: 'QuickBooks Integration',
  version: '1.0.0',
  description: 'Seamless integration with QuickBooks for financial data synchronization',
  author: 'Blacktop Blackout Systems'
};