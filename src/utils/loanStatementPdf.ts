import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Client, CompanySettings, Loan, Payment } from '../types';
import { formatCurrency, formatDate } from './finance';

export function generateLoanStatementPDF(
  loan: Loan,
  payments: Payment[],
  settings: CompanySettings,
  client?: Client | null
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let currentY = 14;

  // Filter payments for this specific loan
  const loanPayments = payments.filter((p) => p.loanId === loan.id);

  // Status text & colors
  const statusLabel = 
    loan.status === 'paid' ? 'LIQUIDADO' :
    loan.status === 'overdue' ? 'EN MORA' : 'AL DÍA / ACTIVO';

  // 1. Header Banner
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(margin, currentY, pageWidth - margin * 2, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(settings.companyName.toUpperCase(), margin + 5, currentY + 8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `RFC/Tax ID: ${settings.taxId || 'N/A'}  |  Tel: ${settings.phone || 'N/A'}  |  Email: ${settings.email || 'N/A'}`,
    margin + 5,
    currentY + 14
  );
  doc.text(settings.address || 'Oficina Central', margin + 5, currentY + 18);

  // Document Title on top right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('ESTADO DE CUENTA DE PRÉSTAMO', pageWidth - margin - 5, currentY + 8, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Folio: ${loan.id}`, pageWidth - margin - 5, currentY + 13, { align: 'right' });
  doc.text(`Fecha Emisión: ${formatDate(new Date().toISOString())}`, pageWidth - margin - 5, currentY + 18, { align: 'right' });

  currentY += 26;

  // 2. Client & Loan Overview (2-column layout)
  const boxWidth = (pageWidth - margin * 2 - 6) / 2;
  const boxHeight = 36;

  // Client Box
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(margin, currentY, boxWidth, boxHeight, 2, 2, 'FD');

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('INFORMACIÓN DEL PRESTATARIO', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  doc.setFont('helvetica', 'bold');
  doc.text('Nombre:', margin + 4, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(loan.clientName, margin + 22, currentY + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Documento:', margin + 4, currentY + 17);
  doc.setFont('helvetica', 'normal');
  doc.text(loan.clientDocumentId, margin + 22, currentY + 17);

  doc.setFont('helvetica', 'bold');
  doc.text('Teléfono:', margin + 4, currentY + 22);
  doc.setFont('helvetica', 'normal');
  doc.text(loan.clientPhone || client?.phone || 'No registrado', margin + 22, currentY + 22);

  doc.setFont('helvetica', 'bold');
  doc.text('Email:', margin + 4, currentY + 27);
  doc.setFont('helvetica', 'normal');
  doc.text(loan.clientEmail || client?.email || 'No registrado', margin + 22, currentY + 27);

  doc.setFont('helvetica', 'bold');
  doc.text('Dirección:', margin + 4, currentY + 32);
  doc.setFont('helvetica', 'normal');
  const addressText = client?.address || settings.address;
  doc.text(doc.splitTextToSize(addressText, boxWidth - 24), margin + 22, currentY + 32);

  // Loan Summary Box
  const rightBoxX = margin + boxWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightBoxX, currentY, boxWidth, boxHeight, 2, 2, 'FD');

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('CONDICIONES DEL CRÉDITO', rightBoxX + 4, currentY + 6);

  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.text('Monto Capital:', rightBoxX + 4, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(formatCurrency(loan.principal, settings.currency, settings.currencyCode), rightBoxX + 30, currentY + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Tasa Interés:', rightBoxX + 58, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${loan.interestRate}%`, rightBoxX + 78, currentY + 12);

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.text('Plazo / Cuotas:', rightBoxX + 4, currentY + 17);
  doc.setFont('helvetica', 'normal');
  doc.text(`${loan.termCount} cuotas (${loan.frequency})`, rightBoxX + 30, currentY + 17);

  doc.setFont('helvetica', 'bold');
  doc.text('Sistema:', rightBoxX + 58, currentY + 17);
  doc.setFont('helvetica', 'normal');
  doc.text(loan.amortizationType.toUpperCase(), rightBoxX + 78, currentY + 17);

  // Row 3
  doc.setFont('helvetica', 'bold');
  doc.text('Fecha Inicio:', rightBoxX + 4, currentY + 22);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(loan.startDate), rightBoxX + 30, currentY + 22);

  doc.setFont('helvetica', 'bold');
  doc.text('Estatus:', rightBoxX + 58, currentY + 22);
  doc.setFont('helvetica', 'bold');
  if (loan.status === 'overdue') {
    doc.setTextColor(225, 29, 72); // Rose
  } else if (loan.status === 'paid') {
    doc.setTextColor(5, 150, 105); // Emerald
  } else {
    doc.setTextColor(37, 99, 235); // Blue
  }
  doc.text(statusLabel, rightBoxX + 78, currentY + 22);

  // Row 4 (Balances)
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Pactado:', rightBoxX + 4, currentY + 27);
  doc.text(formatCurrency(loan.totalAmount, settings.currency, settings.currencyCode), rightBoxX + 30, currentY + 27);

  doc.text('Pagado:', rightBoxX + 58, currentY + 27);
  doc.setTextColor(5, 150, 105);
  doc.text(formatCurrency(loan.paidAmount, settings.currency, settings.currencyCode), rightBoxX + 78, currentY + 27);

  // Row 5
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('Saldo Deudor:', rightBoxX + 4, currentY + 32);
  doc.setTextColor(loan.remainingBalance > 0 ? 225 : 5, loan.remainingBalance > 0 ? 29 : 150, loan.remainingBalance > 0 ? 72 : 105);
  doc.text(formatCurrency(loan.remainingBalance, settings.currency, settings.currencyCode), rightBoxX + 30, currentY + 32);

  currentY += boxHeight + 6;

  // 3. Section: Cronograma de Cuotas y Amortización
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CRONOGRAMA DE CUOTAS Y AMORTIZACIÓN', margin, currentY);
  currentY += 2;

  // Prepare installments table rows
  const installmentRows = loan.installments.map((inst) => {
    const statusText = 
      inst.status === 'paid' ? 'PAGADA' :
      inst.status === 'overdue' ? `EN MORA (${inst.lateDays}d)` :
      inst.status === 'partial' ? 'PARCIAL' : 'PENDIENTE';

    return [
      `#${inst.number}`,
      formatDate(inst.dueDate),
      formatCurrency(inst.principal, settings.currency, settings.currencyCode),
      formatCurrency(inst.interest, settings.currency, settings.currencyCode),
      inst.lateFee > 0 ? formatCurrency(inst.lateFee, settings.currency, settings.currencyCode) : '-',
      formatCurrency(inst.totalDue, settings.currency, settings.currencyCode),
      formatCurrency(inst.paidAmount, settings.currency, settings.currencyCode),
      inst.paidDate ? formatDate(inst.paidDate) : '-',
      statusText,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [[
      '# Cuota',
      'Vencimiento',
      'Capital',
      'Interés',
      'Recargo/Mora',
      'Total Cuota',
      'Pagado',
      'Fecha Pago',
      'Estado',
    ]],
    body: installmentRows,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [67, 56, 202], // Indigo-700
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold', cellWidth: 14 },
      1: { halign: 'center', cellWidth: 20 },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right', fontStyle: 'bold' },
      6: { halign: 'right' },
      7: { halign: 'center' },
      8: { halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 8) {
        const val = String(data.cell.raw);
        if (val.includes('PAGADA')) {
          data.cell.styles.textColor = [5, 150, 105];
        } else if (val.includes('EN MORA')) {
          data.cell.styles.textColor = [225, 29, 72];
        } else {
          data.cell.styles.textColor = [100, 116, 139];
        }
      }
    },
    margin: { left: margin, right: margin },
  });

  // Get Y after installments table
  // @ts-expect-error - jspdf-autotable adds lastAutoTable to doc
  currentY = doc.lastAutoTable.finalY + 8;

  // Check if we need a new page for payments table
  if (currentY > 230) {
    doc.addPage();
    currentY = margin + 4;
  }

  // 4. Section: Historial de Pagos Realizados
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('HISTORIAL DE PAGOS Y ABONOS REGISTRADOS', margin, currentY);
  currentY += 2;

  const paymentRows = loanPayments.length > 0
    ? loanPayments.map((p) => [
        formatDate(p.paidAt),
        p.paymentReference || p.id,
        `Cuota #${p.installmentNumbers.join(', #')}`,
        p.paymentMethod.replace('_', ' ').toUpperCase(),
        formatCurrency(p.principalAmount, settings.currency, settings.currencyCode),
        formatCurrency(p.interestAmount, settings.currency, settings.currencyCode),
        p.lateFeeAmount > 0 ? formatCurrency(p.lateFeeAmount, settings.currency, settings.currencyCode) : '-',
        formatCurrency(p.amount, settings.currency, settings.currencyCode),
        p.status === 'completed' ? 'APLICADO' : p.status.toUpperCase(),
      ])
    : [[
        '-',
        'Sin pagos registrados aún',
        '-',
        '-',
        '-',
        '-',
        '-',
        formatCurrency(0, settings.currency, settings.currencyCode),
        'PENDIENTE',
      ]];

  autoTable(doc, {
    startY: currentY,
    head: [[
      'Fecha / Hora',
      'Folio de Pago',
      'Cuotas Cubiertas',
      'Método',
      'Abono Capital',
      'Interés',
      'Mora',
      'Monto Total',
      'Estatus',
    ]],
    body: paymentRows,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [15, 23, 42], // Slate-900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 22 },
      1: { halign: 'center', cellWidth: 26, fontStyle: 'bold' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right', fontStyle: 'bold', textColor: [5, 150, 105] },
      8: { halign: 'center', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
  });

  // @ts-expect-error - jspdf-autotable adds lastAutoTable to doc
  currentY = doc.lastAutoTable.finalY + 8;

  // Check if we need room for summary / signatures
  if (currentY > 240) {
    doc.addPage();
    currentY = margin + 4;
  }

  // 5. Total Balance Block
  const totalLateFeeIncurred = loan.installments.reduce((sum, i) => sum + (i.lateFee || 0), 0);
  const summaryBoxWidth = pageWidth - margin * 2;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, summaryBoxWidth, 18, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN DE CUENTA:', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.text(`Capital: ${formatCurrency(loan.principal, settings.currency, settings.currencyCode)}`, margin + 40, currentY + 6);
  doc.text(`Interés Total: ${formatCurrency(loan.totalInterest, settings.currency, settings.currencyCode)}`, margin + 85, currentY + 6);
  doc.text(`Recargos Mora: ${formatCurrency(totalLateFeeIncurred, settings.currency, settings.currencyCode)}`, margin + 135, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text(`Total Amortizado: ${formatCurrency(loan.paidAmount, settings.currency, settings.currencyCode)}`, margin + 4, currentY + 13);
  doc.setTextColor(loan.remainingBalance > 0 ? 225 : 5, loan.remainingBalance > 0 ? 29 : 150, loan.remainingBalance > 0 ? 72 : 105);
  doc.text(`Saldo Deudor Actual: ${formatCurrency(loan.remainingBalance, settings.currency, settings.currencyCode)}`, margin + 85, currentY + 13);

  // 6. Footer Disclaimer & Signatures
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Documento emitido por ${settings.companyName} • Folio de Control: ${loan.id} • Página ${i} de ${pageCount}`,
      pageWidth / 2,
      285,
      { align: 'center' }
    );
  }

  return doc;
}

export function downloadLoanStatementPDF(
  loan: Loan,
  payments: Payment[],
  settings: CompanySettings,
  client?: Client | null
): void {
  const doc = generateLoanStatementPDF(loan, payments, settings, client);
  const cleanId = loan.id.replace(/[^a-zA-Z0-9-_]/g, '_');
  doc.save(`Estado_de_Cuenta_${cleanId}.pdf`);
}
