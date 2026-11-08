import { Installment, Loan, NotificationLog } from '../types';
import { formatCurrency, formatDate, getDaysDifference } from './finance';

export interface PendingAlert {
  loan: Loan;
  installment: Installment;
  type: 'due_in_3_days' | 'due_today' | 'overdue';
  daysDiff: number;
}

export function scanUpcomingInstallmentAlerts(loans: Loan[]): PendingAlert[] {
  const alerts: PendingAlert[] = [];

  loans.forEach((loan) => {
    if (loan.status === 'paid' || loan.status === 'pending_approval') return;

    loan.installments.forEach((inst) => {
      if (inst.status === 'paid') return;

      const diff = getDaysDifference(inst.dueDate); // target - today: positive = future, negative = past

      if (diff < 0) {
        // Vencida
        alerts.push({
          loan,
          installment: inst,
          type: 'overdue',
          daysDiff: Math.abs(diff),
        });
      } else if (diff === 0) {
        // Vence hoy
        alerts.push({
          loan,
          installment: inst,
          type: 'due_today',
          daysDiff: 0,
        });
      } else if (diff <= 3) {
        // Próxima a vencer
        alerts.push({
          loan,
          installment: inst,
          type: 'due_in_3_days',
          daysDiff: diff,
        });
      }
    });
  });

  return alerts;
}

export function buildNotificationMessage(
  alert: PendingAlert,
  companyName: string,
  currency: string,
  currencyCode: string,
  paymentUrl: string
): string {
  const { loan, installment, type, daysDiff } = alert;
  const formattedAmount = formatCurrency(installment.totalDue, currency, currencyCode);

  if (type === 'due_in_3_days') {
    return `Estimado(a) ${loan.clientName}, le recordamos de parte de ${companyName} que su cuota #${installment.number} por ${formattedAmount} tiene fecha de vencimiento el ${formatDate(installment.dueDate)} (faltan ${daysDiff} días). Evite recargos por mora pagando en línea aquí: ${paymentUrl}`;
  } else if (type === 'due_today') {
    return `Hola ${loan.clientName}, hoy ${formatDate(installment.dueDate)} es el vencimiento de su cuota #${installment.number} en ${companyName}. Monto a liquidar: ${formattedAmount}. Realice su pago seguro al instante aquí: ${paymentUrl}`;
  } else {
    return `AVISO DE COBRANZA: Estimado(a) ${loan.clientName}, su cuota #${installment.number} en ${companyName} presenta un atraso de ${daysDiff} días. Monto adeudado con moras: ${formattedAmount}. Por favor regularice su situación ingresando a: ${paymentUrl}`;
  }
}

export function generateWhatsAppLink(phoneNumber: string, message: string): string {
  // Limpiar caracteres especiales de teléfono
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function createNotificationEntry(
  loan: Loan,
  installmentNumber: number,
  type: 'reminder_due_3days' | 'reminder_due_today' | 'overdue_notice' | 'payment_receipt',
  channel: 'whatsapp' | 'sms' | 'email',
  message: string,
  paymentLink?: string
): NotificationLog {
  return {
    id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    loanId: loan.id,
    clientName: loan.clientName,
    clientPhone: loan.clientPhone,
    clientEmail: loan.clientEmail,
    type,
    channel,
    message,
    status: 'sent',
    timestamp: new Date().toISOString(),
    paymentLink,
  };
}
