
import { CompanyInfo } from "@/data/initialData";
import { Sale } from "@/utils/models";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

/**
 * Generates HTML content for a printable receipt with improved design and company info
 */
export const generateReceiptHtml = (
  sale: Sale, 
  dateFormatted: string,
  companyInfo: CompanyInfo
): string => {
  const totalItems = sale.items.reduce((sum, item) => sum + item.quantity, 0);
  
  return `
    <html dir="rtl">
    <head>
      <title>إيصال مشتريات - ${companyInfo.name}</title>
      <meta charset="UTF-8">
      <style>
        @media print {
          @page {
            size: 80mm 297mm;
            margin: 0;
          }
          button.print-button {
            display: none;
          }
        }
        
        body {
          font-family: 'Arial', sans-serif;
          padding: 20px;
          max-width: 80mm;
          margin: 0 auto;
          font-size: 12px;
          background-color: white;
          color: #333;
        }
        
        .receipt {
          border: 1px solid #ddd;
          border-radius: 5px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .header {
          text-align: center;
          padding: 15px 0;
          border-bottom: 1px dashed #ddd;
          background-color: #f8f9fa;
        }
        
        .header h1 {
          margin: 0;
          font-size: 18px;
          color: #333;
        }
        
        .header img.logo {
          max-width: 60px;
          margin-bottom: 10px;
        }
        
        .header p {
          margin: 5px 0;
          font-size: 12px;
          color: #666;
        }
        
        .info-section {
          display: flex;
          flex-direction: column;
          padding: 10px;
          border-bottom: 1px dashed #ddd;
        }
        
        .info-block {
          margin-bottom: 10px;
        }
        
        .info-block h3 {
          margin: 0 0 5px 0;
          font-size: 14px;
          color: #555;
          border-bottom: 1px solid #eee;
          padding-bottom: 3px;
        }
        
        .info-block p {
          margin: 3px 0;
          font-size: 12px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
        }
        
        thead {
          background-color: #f1f1f1;
        }
        
        th, td {
          padding: 8px 4px;
          text-align: right;
          border-bottom: 1px solid #ddd;
        }
        
        th {
          font-weight: bold;
          color: #555;
        }
        
        .total-row td {
          font-weight: bold;
          border-top: 1px solid #999;
          padding-top: 8px;
        }
        
        .footer {
          text-align: center;
          padding: 15px 10px;
          font-size: 10px;
          color: #666;
          border-top: 1px dashed #ddd;
          background-color: #f8f9fa;
        }
        
        .barcode {
          text-align: center;
          padding: 10px 0;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          letter-spacing: 2px;
        }
        
        .print-button {
          display: block;
          margin: 20px auto;
          padding: 10px 20px;
          background-color: #0066cc;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .print-button:hover {
          background-color: #0052a3;
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          ${companyInfo.logo ? `<img src="${companyInfo.logo}" alt="${companyInfo.name}" class="logo">` : ''}
          <h1>${companyInfo.name}</h1>
          <p>${companyInfo.slogan || ''}</p>
          <p>${companyInfo.contact?.address || ''}</p>
          <p>هاتف: ${companyInfo.contact?.phone || ''}</p>
          <p>البريد الإلكتروني: ${companyInfo.contact?.email || ''}</p>
        </div>
        
        <div class="info-section">
          <div class="info-block">
            <h3>تفاصيل المبيعة</h3>
            <p><strong>رقم الإيصال:</strong> ${sale.id.substring(0, 8)}</p>
            <p><strong>تاريخ:</strong> ${dateFormatted}</p>
          </div>
          
          <div class="info-block">
            <h3>معلومات العميل</h3>
            <p><strong>الاسم:</strong> ${sale.customer_name || 'عميل'}</p>
            ${sale.customer_phone ? `<p><strong>الهاتف:</strong> ${sale.customer_phone}</p>` : ''}
            ${sale.customer_email ? `<p><strong>البريد الإلكتروني:</strong> ${sale.customer_email}</p>` : ''}
          </div>
        </div>
        
        <div style="padding: 10px;">
          <h3 style="margin: 5px 0;">المنتجات</h3>
          <table>
            <thead>
              <tr>
                <th>المنتج</th>
                <th>السعر</th>
                <th>العدد</th>
                <th>المجموع</th>
              </tr>
            </thead>
            <tbody>
              ${sale.items.map(item => `
                <tr>
                  <td>${item.product_name}</td>
                  <td>${item.unit_price.toLocaleString()} د.ع</td>
                  <td>${item.quantity}</td>
                  <td>${item.total_price.toLocaleString()} د.ع</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="2"><strong>المجموع الكلي</strong></td>
                <td><strong>${totalItems}</strong></td>
                <td><strong>${sale.total_amount.toLocaleString()} د.ع</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="barcode">
          * ${sale.id.substring(0, 8)} *
        </div>
        
        <div class="footer">
          <p>شكراً لتعاملكم معنا</p>
          <p>هذا الإيصال دليل على عملية الشراء</p>
          <p>${new Date().getFullYear()} © ${companyInfo.name}</p>
        </div>
      </div>
      
      <button onclick="window.print();" class="print-button">
        طباعة الإيصال
      </button>
    </body>
    </html>
  `;
};

/**
 * Opens a new window with the receipt and triggers printing
 */
export const printReceipt = (
  sale: Sale,
  companyInfo: CompanyInfo
): void => {
  const receiptWindow = window.open('', '_blank');
  if (!receiptWindow) {
    console.error("Failed to open receipt window - popup blocked?");
    return;
  }
  
  const now = new Date();
  const dateFormatted = format(now, 'yyyy/MM/dd hh:mm a', { locale: ar });
  
  const receiptHtml = generateReceiptHtml(sale, dateFormatted, companyInfo);
  
  receiptWindow.document.write(receiptHtml);
  receiptWindow.document.close();
  
  // Delay printing to ensure content is fully loaded
  setTimeout(() => {
    receiptWindow.focus();
    receiptWindow.print();
  }, 500);
};
