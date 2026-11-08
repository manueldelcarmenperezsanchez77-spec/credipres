import { CompanySettings, ElectronicInvoice, Payment } from '../types';

export function generateFiscalUuid(): string {
  const chars = '0123456789ABCDEF';
  const segment = (len: number) => {
    let res = '';
    for (let i = 0; i < len; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };
  return `${segment(8)}-${segment(4)}-4${segment(3)}-8${segment(3)}-${segment(12)}`;
}

export function createElectronicInvoice(
  payment: Payment,
  company: CompanySettings,
  clientRfcDni: string,
  clientEmail: string
): ElectronicInvoice {
  // En créditos financieros, el capital devuelto no genera IVA, pero los intereses devengados sí generan IVA (16% estándar)
  const taxableBase = payment.interestAmount + payment.lateFeeAmount;
  const taxRate = 0.16;
  const taxAmount = Number((taxableBase * (taxRate / (1 + taxRate))).toFixed(2));
  const subtotal = Number((taxableBase - taxAmount).toFixed(2));
  const exemptAmount = payment.principalAmount;

  const count = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  const invoiceNumber = `FE-${year}-${count}`;

  return {
    id: 'inv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    invoiceNumber,
    fiscalUuid: generateFiscalUuid(),
    loanId: payment.loanId,
    paymentId: payment.id,
    clientName: payment.clientName,
    clientDocumentId: clientRfcDni,
    clientEmail: clientEmail,
    subtotal,
    taxAmount,
    exemptAmount,
    total: payment.amount,
    issuedAt: new Date().toISOString(),
    status: 'timbrado',
    concept: `Comprobante Fiscal Digital por Cobro de Cuota(s) #${payment.installmentNumbers.join(', ')} - Préstamo ${payment.loanId.toUpperCase()}`,
    paymentMethodDesc: payment.paymentMethod === 'stripe_card' ? 'Tarjeta Bancaria (En Línea)' :
                       payment.paymentMethod === 'bank_transfer' ? 'Transferencia Electrónica SPEI' :
                       payment.paymentMethod === 'payment_link' ? 'Pasarela Pasarela Web Link' :
                       payment.paymentMethod === 'qr_instant' ? 'Cobro Digital QR' : 'Efectivo en Ventanilla',
  };
}

export function generateInvoiceXml(invoice: ElectronicInvoice, company: CompanySettings): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante 
    xmlns:cfdi="http://www.sat.gob.mx/cfd/4" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    Version="4.0"
    Serie="F"
    Folio="${invoice.invoiceNumber}"
    Fecha="${invoice.issuedAt}"
    Sello="f2j0P9Kx8Q...DigitalSignatureHash...=="
    FormaPago="${invoice.paymentMethodDesc}"
    NoCertificado="30001000000500003416"
    SubTotal="${(invoice.subtotal + invoice.exemptAmount).toFixed(2)}"
    Moneda="${company.currencyCode}"
    Total="${invoice.total.toFixed(2)}"
    TipoDeComprobante="I"
    Exportacion="01"
    MetodoPago="PUE"
    LugarExpedicion="06000">
    <cfdi:Emisor 
        Rfc="${company.taxId}" 
        Nombre="${company.companyName}" 
        RegimenFiscal="${company.fiscalRegime}"/>
    <cfdi:Receptor 
        Rfc="${invoice.clientDocumentId}" 
        Nombre="${invoice.clientName}" 
        DomicilioFiscalReceptor="06000" 
        RegimenFiscalReceptor="605" 
        UsoCFDI="S01"/>
    <cfdi:Conceptos>
        <cfdi:Concepto 
            ClaveProdServ="84121500" 
            Cantidad="1" 
            ClaveUnidad="ACT" 
            Descripcion="Servicios de Préstamo Personal e Intereses Devengados" 
            ValorUnitario="${invoice.total.toFixed(2)}" 
            Importe="${invoice.total.toFixed(2)}" 
            ObjetoImp="02">
            <cfdi:Impuestos>
                <cfdi:Traslados>
                    <cfdi:Traslado 
                        Base="${invoice.subtotal.toFixed(2)}" 
                        Impuesto="002" 
                        TipoFactor="Tasa" 
                        TasaOCuota="0.160000" 
                        Importe="${invoice.taxAmount.toFixed(2)}"/>
                </cfdi:Traslados>
            </cfdi:Impuestos>
        </cfdi:Concepto>
    </cfdi:Conceptos>
    <cfdi:Complemento>
        <tfd:TimbreFiscalDigital 
            xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" 
            Version="1.1" 
            UUID="${invoice.fiscalUuid}" 
            FechaTimbrado="${invoice.issuedAt}" 
            RfcProvCertif="SAT970701NN3" 
            SelloCFD="dGhpcyBpcyBhIHZhbGlkIHNpZ25hdHVyZQ==" 
            NoCertificadoSAT="00001000000504465028"/>
    </cfdi:Complemento>
</cfdi:Comprobante>`;
}
