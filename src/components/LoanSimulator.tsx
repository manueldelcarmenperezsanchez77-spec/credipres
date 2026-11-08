import React, { useState } from 'react';
import { 
  Calculator, 
  ArrowRight, 
  CheckCircle2, 
  DollarSign, 
  Calendar, 
  Percent, 
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { AmortizationType, CompanySettings, LoanFrequency } from '../types';
import { calculateAmortizationSchedule, formatCurrency, formatDate } from '../utils/finance';

interface LoanSimulatorProps {
  settings: CompanySettings;
  onProceedToCreateLoan: (simulationData: {
    principal: number;
    interestRate: number;
    termCount: number;
    frequency: LoanFrequency;
    amortizationType: AmortizationType;
  }) => void;
}

export const LoanSimulator: React.FC<LoanSimulatorProps> = ({
  settings,
  onProceedToCreateLoan,
}) => {
  const [principal, setPrincipal] = useState<number>(5000);
  const [rate, setRate] = useState<number>(2.5); // % por periodo
  const [termCount, setTermCount] = useState<number>(12);
  const [frequency, setFrequency] = useState<LoanFrequency>('monthly');
  const [amortizationType, setAmortizationType] = useState<AmortizationType>('french');

  const todayStr = new Date().toISOString().split('T')[0];

  const simulation = calculateAmortizationSchedule(
    principal,
    rate,
    termCount,
    frequency,
    amortizationType,
    todayStr
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-2">
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulador Financiero en Tiempo Real</span>
            </span>
            <h2 className="text-2xl font-bold tracking-tight">
              Cotizador y Calculadora de Amortizaciones
            </h2>
            <p className="text-slate-300 text-xs mt-1 max-w-xl">
              Simule diferentes escenarios de crédito, evalúe la capacidad de pago y genere cronogramas instantáneos bajo sistemas Francés, Alemán o Simple.
            </p>
          </div>

          <button
            onClick={() => onProceedToCreateLoan({ principal, interestRate: rate, termCount, frequency, amortizationType })}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition shadow-xs self-start md:self-center"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Convertir en Préstamo Oficial</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Parámetros del Crédito
          </h3>

          {/* Principal Amount */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700">Monto del Préstamo</label>
              <span className="text-xs font-extrabold text-indigo-600 font-mono">
                {formatCurrency(principal, settings.currency, settings.currencyCode)}
              </span>
            </div>
            <input
              type="number"
              min="500"
              max="50000"
              step="100"
              value={principal}
              onChange={(e) => setPrincipal(Math.max(100, parseFloat(e.target.value) || 100))}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            />
            <input
              type="range"
              min="500"
              max="30000"
              step="500"
              value={principal}
              onChange={(e) => setPrincipal(parseFloat(e.target.value))}
              className="w-full mt-2 accent-indigo-600"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700">Tasa de Interés Periódica</label>
              <span className="text-xs font-extrabold text-indigo-600 font-mono">{rate}%</span>
            </div>
            <input
              type="number"
              min="0.5"
              max="20"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            />
            <input
              type="range"
              min="0.5"
              max="15"
              step="0.25"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full mt-2 accent-indigo-600"
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Frecuencia de Pago</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'monthly', label: 'Mensual' },
                { id: 'biweekly', label: 'Quincenal' },
                { id: 'weekly', label: 'Semanal' },
                { id: 'daily', label: 'Diario' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFrequency(f.id as LoanFrequency)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition border ${
                    frequency === f.id
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Term Count */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700">Número de Cuotas</label>
              <span className="text-xs font-extrabold text-indigo-600 font-mono">{termCount} cuotas</span>
            </div>
            <input
              type="number"
              min="1"
              max="60"
              value={termCount}
              onChange={(e) => setTermCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Amortization System */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Sistema de Amortización</label>
            <select
              value={amortizationType}
              onChange={(e) => setAmortizationType(e.target.value as AmortizationType)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="french">Francés (Cuota periódica fija)</option>
              <option value="german">Alemán (Capital constante, cuota decreciente)</option>
              <option value="fixed">Interés Fijo / Flat (Microcrédito)</option>
            </select>
          </div>
        </div>

        {/* Results & Schedule Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Cuota Periódica Aprox.
              </span>
              <div className="text-2xl font-extrabold text-indigo-600 mt-1 font-mono">
                {formatCurrency(simulation.periodicPayment, settings.currency, settings.currencyCode)}
              </div>
              <span className="text-[10px] text-slate-500">Por cada período</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Intereses
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
                {formatCurrency(simulation.totalInterest, settings.currency, settings.currencyCode)}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">Rentabilidad del crédito</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Monto Total a Pagar
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
                {formatCurrency(simulation.totalAmount, settings.currency, settings.currencyCode)}
              </div>
              <span className="text-[10px] text-slate-500">Capital + Intereses</span>
            </div>
          </div>

          {/* Amortization Table Preview */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Cronograma de Amortización Proyectado ({simulation.installments.length} Cuotas)
              </h4>
              <span className="text-[11px] text-slate-500">
                Inicio: {formatDate(todayStr)}
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-white text-slate-400 uppercase text-[10px] font-bold sticky top-0 border-b border-slate-200 shadow-xs">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Vencimiento</th>
                    <th className="py-2.5 px-3 text-right">Capital</th>
                    <th className="py-2.5 px-3 text-right">Interés</th>
                    <th className="py-2.5 px-3 text-right">Total Cuota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {simulation.installments.map((inst) => (
                    <tr key={inst.number} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">#{inst.number}</td>
                      <td className="py-2.5 px-3 font-medium">{formatDate(inst.dueDate)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {formatCurrency(inst.principal, settings.currency, settings.currencyCode)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-indigo-600">
                        {formatCurrency(inst.interest, settings.currency, settings.currencyCode)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-extrabold text-slate-900">
                        {formatCurrency(inst.totalDue, settings.currency, settings.currencyCode)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
