import { AmortizationType, Installment, LoanFrequency } from '../types';

export function formatCurrency(amount: number, currency = '$', code = 'USD'): string {
  return `${currency}${amount.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${code}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    const d = new Date(dateString);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateString;
  }
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function getDaysDifference(targetDate: string, fromDate = new Date()): number {
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const from = new Date(fromDate);
  from.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - from.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function getIntervalDays(frequency: LoanFrequency): number {
  switch (frequency) {
    case 'daily': return 1;
    case 'weekly': return 7;
    case 'biweekly': return 15;
    case 'monthly': return 30;
    default: return 30;
  }
}

export interface AmortizationResult {
  installments: Installment[];
  totalPrincipal: number;
  totalInterest: number;
  totalAmount: number;
  periodicPayment: number;
}

export function calculateAmortizationSchedule(
  principal: number,
  periodRatePercent: number, // Tasa periódica en %
  termCount: number,
  frequency: LoanFrequency,
  amortizationType: AmortizationType,
  startDateStr: string,
  feePerInstallment = 0
): AmortizationResult {
  const r = periodRatePercent / 100;
  const n = termCount;
  const intervalDays = getIntervalDays(frequency);
  const installments: Installment[] = [];

  let balance = principal;
  let totalInterest = 0;
  let totalPrincipal = 0;
  let periodicPayment = 0;

  if (amortizationType === 'french') {
    // Cuota fija francesa: PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
    if (r > 0) {
      periodicPayment = (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
    } else {
      periodicPayment = principal / n;
    }

    let currentDate = startDateStr;
    for (let i = 1; i <= n; i++) {
      currentDate = addDays(currentDate, intervalDays);
      const interestPart = balance * r;
      let principalPart = periodicPayment - interestPart;

      // Ajuste de redondeo en la última cuota
      if (i === n || balance - principalPart < 0.05) {
        principalPart = balance;
      }

      const installmentTotal = principalPart + interestPart + feePerInstallment;
      balance = Math.max(0, balance - principalPart);
      totalInterest += interestPart;
      totalPrincipal += principalPart;

      installments.push({
        number: i,
        dueDate: currentDate,
        principal: Number(principalPart.toFixed(2)),
        interest: Number(interestPart.toFixed(2)),
        fee: feePerInstallment,
        totalDue: Number(installmentTotal.toFixed(2)),
        paidAmount: 0,
        remainingAmount: Number(installmentTotal.toFixed(2)),
        status: 'pending',
        lateDays: 0,
        lateFee: 0,
      });
    }
  } else if (amortizationType === 'german') {
    // Sistema alemán: Capital constante amortizado por cuota
    const fixedPrincipalPart = principal / n;
    let currentDate = startDateStr;

    for (let i = 1; i <= n; i++) {
      currentDate = addDays(currentDate, intervalDays);
      const interestPart = balance * r;
      let principalPart = fixedPrincipalPart;

      if (i === n || balance - principalPart < 0.05) {
        principalPart = balance;
      }

      const installmentTotal = principalPart + interestPart + feePerInstallment;
      balance = Math.max(0, balance - principalPart);
      totalInterest += interestPart;
      totalPrincipal += principalPart;

      installments.push({
        number: i,
        dueDate: currentDate,
        principal: Number(principalPart.toFixed(2)),
        interest: Number(interestPart.toFixed(2)),
        fee: feePerInstallment,
        totalDue: Number(installmentTotal.toFixed(2)),
        paidAmount: 0,
        remainingAmount: Number(installmentTotal.toFixed(2)),
        status: 'pending',
        lateDays: 0,
        lateFee: 0,
      });
    }
    periodicPayment = installments[0]?.totalDue || 0;
  } else {
    // Interés Fijo / Simple (Flat rate)
    const totalInterestFlat = principal * r * n;
    const interestPartPerInstallment = totalInterestFlat / n;
    const principalPartPerInstallment = principal / n;
    periodicPayment = principalPartPerInstallment + interestPartPerInstallment + feePerInstallment;

    let currentDate = startDateStr;
    for (let i = 1; i <= n; i++) {
      currentDate = addDays(currentDate, intervalDays);
      totalInterest += interestPartPerInstallment;
      totalPrincipal += principalPartPerInstallment;

      installments.push({
        number: i,
        dueDate: currentDate,
        principal: Number(principalPartPerInstallment.toFixed(2)),
        interest: Number(interestPartPerInstallment.toFixed(2)),
        fee: feePerInstallment,
        totalDue: Number(periodicPayment.toFixed(2)),
        paidAmount: 0,
        remainingAmount: Number(periodicPayment.toFixed(2)),
        status: 'pending',
        lateDays: 0,
        lateFee: 0,
      });
    }
  }

  const totalAmount = totalPrincipal + totalInterest + (feePerInstallment * n);

  return {
    installments,
    totalPrincipal: Number(totalPrincipal.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
    periodicPayment: Number(periodicPayment.toFixed(2)),
  };
}

export function updateInstallmentsLateFees(
  installments: Installment[],
  lateFeeDailyRate: number
): Installment[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return installments.map((inst) => {
    if (inst.status === 'paid') return inst;

    const due = new Date(inst.dueDate);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      // Mora generada diaria sobre el saldo pendiente de la cuota
      const calculatedLateFee = Number((inst.remainingAmount * (lateFeeDailyRate / 100) * diffDays).toFixed(2));
      return {
        ...inst,
        status: 'overdue',
        lateDays: diffDays,
        lateFee: calculatedLateFee,
        totalDue: Number((inst.remainingAmount + calculatedLateFee).toFixed(2)),
      };
    } else {
      return {
        ...inst,
        lateDays: 0,
        lateFee: 0,
      };
    }
  });
}
