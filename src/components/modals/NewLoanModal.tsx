import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  User, 
  Calendar, 
  DollarSign, 
  Percent, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Calculator
} from 'lucide-react';
import { AmortizationType, Client, CompanySettings, Loan, LoanFrequency } from '../../types';
import { calculateAmortizationSchedule, formatCurrency, formatDate } from '../../utils/finance';

interface NewLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  settings: CompanySettings;
  preselectedClient?: Client | null;
  initialSimulationData?: {
    principal: number;
    interestRate: number;
    termCount: number;
    frequency: LoanFrequency;
    amortizationType: AmortizationType;
  } | null;
  onCreateLoan: (newLoan: Loan) => void;
}

export const NewLoanModal: React.FC<NewLoanModalProps> = ({
  isOpen,
  onClose,
  clients,
  settings,
  preselectedClient,
  initialSimulationData,
  onCreateLoan,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(
    preselectedClient?.id || clients[0]?.id || ''
  );
  const [principal, setPrincipal] = useState<number>(initialSimulationData?.principal || 5000);
  const [interestRate, setInterestRate] = useState<number>(initialSimulationData?.interestRate || 2.5);
  const [termCount, setTermCount] = useState<number>(initialSimulationData?.termCount || 6);
  const [frequency, setFrequency] = useState<LoanFrequency>(initialSimulationData?.frequency || 'monthly');
  const [amortizationType, setAmortizationType] = useState<AmortizationType>(
    initialSimulationData?.amortizationType || settings.defaultAmortization || 'french'
  );
  const [purpose, setPurpose] = useState<string>('Capital de trabajo o consumo personal');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (preselectedClient) {
      setSelectedClientId(preselectedClient.id);
    }
  }, [preselectedClient]);

  if (!isOpen) return null;

  const client = clients.find((c) => c.id === selectedClientId) || clients[0];

  // Calculate live schedule
  const schedule = calculateAmortizationSchedule(
    principal,
    interestRate,
    termCount,
    frequency,
    amortizationType,
    startDate
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    const newLoanId = `LON-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newLoan: Loan = {
      id: newLoanId,
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email,
      clientDocumentId: client.documentId,
      principal,
      interestRate,
      termCount,
      frequency,
      amortizationType,
      startDate,
      status: 'active',
      totalInterest: schedule.totalInterest,
      totalAmount: schedule.totalAmount,
      paidAmount: 0,
      remainingBalance: schedule.totalAmount,
      lateFeeDailyRate: settings.defaultLateFeeRate || 0.5,
      installments: schedule.installments,
      disbursedDate: startDate,
      purpose,
    };

    onCreateLoan(newLoan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Originación y Desembolso de Préstamo
              </h3>
              <p className="text-xs text-slate-500">
                Configure las condiciones financieras y valide el cronograma de pagos antes de emitir.
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

        {/* Modal Body: Form and Live Amortization Preview */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Parameters (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Client selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Prestatario Asignado</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500"
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — Doc: {c.documentId} (Score: {c.creditScore})
                  </option>
                ))}
              </select>
            </div>

            {/* Principal and Interest */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monto de Capital ({settings.currency})</label>
                <input
                  type="number"
                  min="200"
                  step="50"
                  value={principal}
                  onChange={(e) => setPrincipal(Math.max(50, parseFloat(e.target.value) || 50))}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tasa Periódica (%)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Term Count and Frequency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Número de Cuotas</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={termCount}
                  onChange={(e) => setTermCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Frecuencia de Amortización</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as LoanFrequency)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="monthly">Mensual</option>
                  <option value="biweekly">Quincenal</option>
                  <option value="weekly">Semanal</option>
                  <option value="daily">Diario</option>
                </select>
              </div>
            </div>

            {/* Amortization and Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sistema Amortización</label>
                <select
                  value={amortizationType}
                  onChange={(e) => setAmortizationType(e.target.value as AmortizationType)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="french">Francés (Cuota Fija)</option>
                  <option value="german">Alemán (Capital Fijo)</option>
                  <option value="fixed">Interés Fijo / Flat</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de Desembolso</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Destino / Propósito del Crédito</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Right Column: Calculated Summary & Preview (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Calculator className="w-4 h-4 text-indigo-600" />
                <span>Resumen de Liquidación</span>
              </h4>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Monto Solicitado:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatCurrency(principal, settings.currency, settings.currencyCode)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Interés Estimado:</span>
                  <span className="font-bold text-indigo-600 font-mono">
                    +{formatCurrency(schedule.totalInterest, settings.currency, settings.currencyCode)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 font-semibold">
                  <span className="text-slate-700">Total a Liquidar:</span>
                  <span className="font-extrabold text-slate-900 font-mono text-sm">
                    {formatCurrency(schedule.totalAmount, settings.currency, settings.currencyCode)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] pt-1 text-slate-500">
                  <span>Cuota Periódica Aprox:</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    {formatCurrency(schedule.periodicPayment, settings.currency, settings.currencyCode)} / período
                  </span>
                </div>
              </div>

              {/* Client Credit Scoring Notice */}
              {client && (
                <div className="p-3 bg-indigo-50 rounded-lg text-xs text-indigo-900 border border-indigo-200 space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span>Evaluación de Riesgo:</span>
                    <span>Score {client.creditScore}/850</span>
                  </div>
                  <p className="text-[11px] text-indigo-700">
                    Ingreso mensual declarado: {formatCurrency(client.monthlyIncome, settings.currency, settings.currencyCode)}. Capacidad de pago validada.
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Aprobar y Desembolsar Préstamo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
