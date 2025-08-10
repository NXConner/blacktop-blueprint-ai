export type PayPeriod = 'weekly' | 'biweekly' | 'monthly';

export interface EmployeePay {
  employeeId: string;
  name: string;
  hourlyRate: number;
  hoursWorked: number;
}

export interface PayrollResult {
  gross: number;
  fica: number;
  futa: number;
  suta: number;
  taxesTotal: number;
  net: number;
}

const FICA_RATE = 0.0765; // 7.65%
const FUTA_RATE = 0.006; // placeholder 0.6%
const SUTA_RATE = 0.02; // placeholder 2%

class PayrollService {
  runPayroll(employees: EmployeePay[], period: PayPeriod = 'weekly'): PayrollResult {
    const gross = employees.reduce((sum, e) => sum + e.hourlyRate * e.hoursWorked, 0);
    const fica = gross * FICA_RATE;
    const futa = gross * FUTA_RATE;
    const suta = gross * SUTA_RATE;
    const taxesTotal = fica + futa + suta;
    const net = gross - taxesTotal;
    return { gross, fica, futa, suta, taxesTotal, net };
  }
}

export const payrollService = new PayrollService();