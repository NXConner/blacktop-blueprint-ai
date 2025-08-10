import { supabase } from '@/integrations/supabase/client';
import { InvoicePayload } from '@/services/invoicing';

const DEFAULT_ACCOUNTS = {
  accountsReceivable: '1100',
  revenue: '4000',
  materials: '5000',
  labor: '5100',
  overhead: '5200',
};

async function getAccountIdByCode(code: string): Promise<string | null> {
  const { data } = await supabase.from('chart_of_accounts').select('id').eq('code', code).maybeSingle();
  return data?.id || null;
}

export async function postInvoiceToGL(invoice: InvoicePayload): Promise<string | null> {
  const arId = await getAccountIdByCode(DEFAULT_ACCOUNTS.accountsReceivable);
  const revenueId = await getAccountIdByCode(DEFAULT_ACCOUNTS.revenue);
  const materialsId = await getAccountIdByCode(DEFAULT_ACCOUNTS.materials);
  const laborId = await getAccountIdByCode(DEFAULT_ACCOUNTS.labor);
  const overheadId = await getAccountIdByCode(DEFAULT_ACCOUNTS.overhead);

  if (!arId || !revenueId) return null;

  const entryNumber = 'JE-' + Date.now();
  const total = invoice.total;
  const materials = invoice.items.find(i => i.description.toLowerCase().includes('materials'))?.amount || 0;
  const labor = invoice.items.find(i => i.description.toLowerCase().includes('labor'))?.amount || 0;
  const overhead = invoice.items.find(i => i.description.toLowerCase().includes('overhead'))?.amount || 0;
  const revenue = total - materials - labor - overhead;

  const { data: je, error } = await supabase
    .from('journal_entries')
    .insert({
      entry_number: entryNumber,
      description: `Invoice ${invoice.id} - ${invoice.clientName || ''}`,
      total_debit: total,
      total_credit: total,
      is_posted: true,
    })
    .select('*')
    .single();

  if (error) return null;

  const lines = [
    { journal_entry_id: je.id, account_id: arId, account_code: DEFAULT_ACCOUNTS.accountsReceivable, account_name: 'Accounts Receivable', debit_amount: total, credit_amount: 0, line_number: 1 },
    { journal_entry_id: je.id, account_id: revenueId, account_code: DEFAULT_ACCOUNTS.revenue, account_name: 'Revenue', debit_amount: 0, credit_amount: revenue, line_number: 2 },
  ];

  if (materialsId && materials > 0) lines.push({ journal_entry_id: je.id, account_id: materialsId, account_code: DEFAULT_ACCOUNTS.materials, account_name: 'Materials Expense', debit_amount: 0, credit_amount: materials, line_number: lines.length + 1 } as any);
  if (laborId && labor > 0) lines.push({ journal_entry_id: je.id, account_id: laborId, account_code: DEFAULT_ACCOUNTS.labor, account_name: 'Labor Expense', debit_amount: 0, credit_amount: labor, line_number: lines.length + 1 } as any);
  if (overheadId && overhead > 0) lines.push({ journal_entry_id: je.id, account_id: overheadId, account_code: DEFAULT_ACCOUNTS.overhead, account_name: 'Overhead Expense', debit_amount: 0, credit_amount: overhead, line_number: lines.length + 1 } as any);

  await supabase.from('journal_entry_lines').insert(lines);
  return je.id as string;
}