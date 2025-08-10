import { supabase } from '../lib/supabase';
import { GeneralLedgerEntry, TrialBalance, FinancialReport } from '../models/GeneralLedger';

export const GeneralLedgerService = {
  // Mendapatkan general ledger entries
  async getAll(coaCode?: string, dateFrom?: string, dateTo?: string): Promise<{ data: GeneralLedgerEntry[] | null, error: any }> {
    let query = supabase
      .from('general_ledger')
      .select(`
        *,
        coa:coa_code (
          code,
          name,
          category,
          subcategory
        ),
        journal_entry:journal_entry_id (
          id,
          entry_number,
          description
        )
      `);
    
    if (coaCode && coaCode !== 'all') {
      query = query.eq('coa_code', coaCode);
    }
    
    if (dateFrom) {
      query = query.gte('transaction_date', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('transaction_date', dateTo);
    }
    
    const { data, error } = await query.order('transaction_date', { ascending: false });
    
    return { data, error };
  },
  
  // Mendapatkan trial balance
  async getTrialBalance(month: number, year: number): Promise<{ data: TrialBalance[] | null, error: any }> {
    const { data, error } = await supabase
      .from('trial_balance')
      .select(`
        *,
        coa:coa_code (
          code,
          name,
          category,
          subcategory
        )
      `)
      .eq('period_month', month)
      .eq('period_year', year)
      .order('coa_code');
    
    return { data, error };
  },
  
  // Generate trial balance untuk periode tertentu
  async generateTrialBalance(month: number, year: number): Promise<{ data: TrialBalance[] | null, error: any }> {
    try {
      // Call stored procedure to generate trial balance
      const { data, error } = await supabase
        .rpc('generate_trial_balance', {
          p_month: month,
          p_year: year
        });
      
      if (error) {
        return { data: null, error };
      }
      
      // Get the generated trial balance
      return await this.getTrialBalance(month, year);
    } catch (error) {
      return { data: null, error };
    }
  },
  
  // Mendapatkan financial reports
  async getFinancialReports(): Promise<{ data: FinancialReport[] | null, error: any }> {
    const { data, error } = await supabase
      .from('financial_reports')
      .select(`
        *,
        generator:generated_by (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },
  
  // Menyimpan financial report
  async saveFinancialReport(report: FinancialReport): Promise<{ data: FinancialReport | null, error: any }> {
    const { data, error } = await supabase
      .from('financial_reports')
      .insert(report)
      .select(`
        *,
        generator:generated_by (
          id,
          name,
          email
        )
      `)
      .single();
    
    return { data, error };
  },
  
  // Generate profit loss report
  async generateProfitLoss(dateFrom: string, dateTo: string): Promise<{ data: any, error: any }> {
    const { data, error } = await supabase
      .rpc('generate_profit_loss_report', {
        p_date_from: dateFrom,
        p_date_to: dateTo
      });
    
    return { data, error };
  },
  
  // Generate balance sheet
  async generateBalanceSheet(asOfDate: string): Promise<{ data: any, error: any }> {
    const { data, error } = await supabase
      .rpc('generate_balance_sheet', {
        p_as_of_date: asOfDate
      });
    
    return { data, error };
  },
  
  // Generate cash flow report
  async generateCashFlow(dateFrom: string, dateTo: string): Promise<{ data: any, error: any }> {
    const { data, error } = await supabase
      .rpc('generate_cash_flow_report', {
        p_date_from: dateFrom,
        p_date_to: dateTo
      });
    
    return { data, error };
  },
  
  // Generate aging report
  async generateAgingReport(asOfDate: string): Promise<{ data: any, error: any }> {
    const { data, error } = await supabase
      .rpc('generate_aging_report', {
        p_as_of_date: asOfDate
      });
    
    return { data, error };
  }
};