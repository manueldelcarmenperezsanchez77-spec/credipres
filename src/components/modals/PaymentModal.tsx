import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  Building, 
  QrCode, 
  DollarSign, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  ExternalLink,
  MessageCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { CompanySettings, Installment, Loan, Payment, PaymentMethod } from '../../types';
import { formatCurrency, formatDate } from '../../utils/finance';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loans: Loan[];
  settings: CompanySettings;
  preselectedLoan?: Loan | null;
  preselectedInstallmentNumber?: number;
  onProcessPayment: (paymentData: {
    loan: Loan;
    installmentNumbers: number[];
    amount: number;
    principalAmount: number;
    interestAmount: number;
    lateFeeAmount: number;
    paymentMethod: PaymentMethod;
    paymentReference: string;
    generateInvoice: boolean;
  }) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  loans,
  settings,
  preselectedLoan,
  preselectedInstallmentNumber,
  onProcessPayment,
}) => {
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [selectedInstallmentNumber, setSelectedInstallmentNumber] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe_card');
  const [generateInvoice, setGenerateInvoice] = useState<boolean>(settings.autoInvoicing);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Card details state for simulation
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('892');

  const activeLoans = loans.filter((l) => l.status !== 'paid');

  useEffect(() => {
    if (preselectedLoan) {
      setSelectedLoanId(preselectedLoan.id);
      if (preselectedInstallmentNumber) {
        setSelectedInstallmentNumber(preselectedInstallmentNumber);
      } else {
        const firstUnpaid = preselectedLoan.installments.find((i) => i.status !== 'paid');
        if (firstUnpaid) setSelectedInstallmentNumber(firstUnpaid.number);
      }
    } else if (activeLoans.length > 0) {
      setSelectedLoanId(activeLoans[0].id);
      const firstUnpaid = activeLoans[0].installments.find((i) => i.status !== 'paid');
      if (firstUnpaid) setSelectedInstallmentNumber(firstUnpaid.number);
    }
  }, [preselectedLoan, preselectedInstallmentNumber, isOpen]);

  if (!isOpen) return null;

  const currentLoan = loans.find((l) => l.id === selectedLoanId);
  const unpaidInstallments = currentLoan?.installments.filter((i) => i.status !== 'paid') || [];
  const currentInstallment = currentLoan?.installments.find((i) => i.number === selectedInstallmentNumber);

  const handleLoanChange = (loanId: string) => {
    setSelectedLoanId(loanId);
    const loan = loans.find((l) => l.id === loanId);
    const firstUnpaid = loan?.installments.find((i) => i.status !== 'paid');
    if (firstUnpaid) {
      setSelectedInstallmentNumber(firstUnpaid.number);
    }
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLoan || !currentInstallment) return;

    setIsProcessing(true);

    const refCode = paymentMethod === 'stripe_card'
      ? `ch_stripe_${Date.now().toString(36).toUpperCase()}`
      : paymentMethod === 'bank_transfer'
      ? `SPEI-${Math.floor(10000000 + Math.random() * 90000000)}`
      : paymentMethod === 'payment_link'
      ? `PLINK-${Date.now().toString(36).toUpperCase()}`
      : `CAJA-${Date.now().toString(36).toUpperCase()}`;

    setTimeout(() => {
      onProcessPayment({
        loan: currentLoan,
        installmentNumbers: [currentInstallment.number],
        amount: currentInstallment.totalDue,
        principalAmount: currentInstallment.principal,
        interestAmount: currentInstallment.interest,
        lateFeeAmount: currentInstallment.lateFee,
        paymentMethod,
        paymentReference: refCode,
        generateInvoice,
      });
      setIsProcessing(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Cobranza y Pasarela de Pago Integrada
              </h3>
              <p className="text-xs text-slate-500">
                Recepción de pagos con conciliación bancaria y facturación electrónica fiscal.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleExecutePayment} className="p-6 space-y-5 text-xs">
          {/* Loan & Installment Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Seleccionar Préstamo</label>
              <select
                value={selectedLoanId}
                onChange={(e) => handleLoanChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500"
                required
              >
                {activeLoans.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.id} - {l.clientName} (Saldo: {formatCurrency(l.remainingBalance, settings.currency, settings.currencyCode)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cuota a Liquidar</label>
              <select
                value={selectedInstallmentNumber}
                onChange={(e) => setSelectedInstallmentNumber(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500"
                required
              >
                {unpaidInstallments.map((inst) => (
                  <option key={inst.number} value={inst.number}>
                    Cuota #{inst.number} — Vence: {formatDate(inst.dueDate)} ({formatCurrency(inst.totalDue, settings.currency, settings.currencyCode)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount Breakdown Card */}
          {currentInstallment && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Amortización a Capital:</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatCurrency(currentInstallment.principal, settings.currency, settings.currencyCode)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Interés Ordinario:</span>
                <span className="font-mono font-bold text-indigo-600">
                  +{formatCurrency(currentInstallment.interest, settings.currency, settings.currencyCode)}
                </span>
              </div>
              {currentInstallment.lateFee > 0 && (
                <div className="flex justify-between items-center text-xs text-rose-600 font-semibold">
                  <span>Recargo por Mora ({currentInstallment.lateDays} días de retraso):</span>
                  <span className="font-mono font-bold">
                    +{formatCurrency(currentInstallment.lateFee, settings.currency, settings.currencyCode)}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs font-extrabold text-slate-900 uppercase">Monto Total a Cobrar:</span>
                <span className="text-lg font-extrabold text-emerald-600 font-mono">
                  {formatCurrency(currentInstallment.totalDue, settings.currency, settings.currencyCode)}
                </span>
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700">Canal / Pasarela de Cobro</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'stripe_card', label: 'Tarjeta (Stripe)', icon: CreditCard },
                { id: 'bank_transfer', label: 'SPEI Bancario', icon: Building },
                { id: 'payment_link', label: 'Link de Pago', icon: QrCode },
                { id: 'cash', label: 'Efectivo Caja', icon: DollarSign },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center space-y-1 transition ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="text-[11px] leading-tight">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Simulated Gateway Fields based on method */}
          {paymentMethod === 'stripe_card' && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulador de Pasarela Segura Stripe</span>
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-xs"
                    placeholder="Número de tarjeta"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-xs text-center"
                    placeholder="MM/AA"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'bank_transfer' && (
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1 text-[11px] text-blue-900">
              <p><strong>CLABE Interbancaria SPEI:</strong> 012 180 0049281920 34</p>
              <p><strong>Banco Receptor:</strong> BBVA México / FinanzaGlobal</p>
              <p><strong>Concepto obligatorio:</strong> {currentLoan?.id}-C{currentInstallment?.number}</p>
            </div>
          )}

          {paymentMethod === 'payment_link' && (
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 flex items-center justify-between text-[11px] text-emerald-900">
              <span>Se generará enlace dinámico seguro listo para enviar por WhatsApp al cliente.</span>
              <ExternalLink className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
            </div>
          )}

          {/* Automatic Invoicing Checkbox */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="chk-auto-invoice"
              checked={generateInvoice}
              onChange={(e) => setGenerateInvoice(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <label htmlFor="chk-auto-invoice" className="font-semibold text-slate-700 cursor-pointer">
              Timbrar y emitir Factura Electrónica fiscal (CFDI 4.0) inmediatamente
            </label>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold transition shadow-md flex items-center space-x-2"
            >
              {isProcessing ? (
                <span>Procesando Cobro con Pasarela...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar y Registrar Pago</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
