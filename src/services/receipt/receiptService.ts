
import { Sale } from '@/utils/models';
import { CompanyInfo } from '@/data/initialData';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export const printReceipt = (sale: Sale, companyInfo?: CompanyInfo) => {
  try {
    console.log('Printing receipt for sale:', sale);
    
    const dateFormatted = format(new Date(sale.created_at), 'yyyy/MM/dd hh:mm a', { locale: ar });
    
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) {
      console.error('Failed to open receipt window. Popup might be blocked.');
      return false;
    }
    
    const companyName = companyInfo?.name || 'متجرنا';
    const companySlogan = companyInfo?.slogan || 'شكراً لتسوقكم معنا';
    
    receiptWindow.document.write(`
      <html dir="rtl">
      <head>
        <title>إيصال مبيعات - ${sale.id.substring(0, 8)}</title>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .info-block {
            width: 45%;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: right;
          }
          th {
            background-color: #f2f2f2;
          }
          .total {
            text-align: left;
            font-weight: bold;
            font-size: 16px;
            margin-top: 10px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          @media print {
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${companyName}</h1>
          <p>${companySlogan}</p>
          <h2>إيصال مبيعات</h2>
          <p>رقم المبيعة: ${sale.id.substring(0, 8)}</p>
          <p>تاريخ: ${dateFormatted}</p>
        </div>
        
        <div class="info-section">
          <div class="info-block">
            <h3>معلومات العميل</h3>
            <p><strong>الاسم:</strong> ${sale.customer_name || 'عميل'}</p>
            ${sale.customer_phone ? `<p><strong>الهاتف:</strong> ${sale.customer_phone}</p>` : ''}
            ${sale.customer_email ? `<p><strong>البريد الإلكتروني:</strong> ${sale.customer_email}</p>` : ''}
          </div>
          <div class="info-block">
            <h3>ملخص المبيعة</h3>
            <p><strong>عدد المنتجات:</strong> ${sale.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
            <p><strong>إجمالي المبلغ:</strong> ${sale.total_amount.toLocaleString()} د.ع</p>
          </div>
        </div>
        
        <h3>المنتجات</h3>
        <table>
          <thead>
            <tr>
              <th>المنتج</th>
              <th>الكمية</th>
              <th>سعر الوحدة</th>
              <th>المجموع</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items.map(item => `
              <tr>
                <td>${item.product_name}</td>
                <td>${item.quantity}</td>
                <td>${item.unit_price.toLocaleString()} د.ع</td>
                <td>${item.total_price.toLocaleString()} د.ع</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          الإجمالي: ${sale.total_amount.toLocaleString()} د.ع
        </div>
        
        <div class="footer">
          <p>شكراً لتعاملكم معنا</p>
          <p>هذا الإيصال دليل على عملية الشراء</p>
        </div>
        
        <button onclick="window.print(); setTimeout(() => window.close(), 500);" style="display: block; margin: 20px auto; padding: 10px 20px;">
          طباعة الإيصال
        </button>
      </body>
      </html>
    `);
    
    receiptWindow.document.close();
    setTimeout(() => {
      receiptWindow.focus();
      // We don't auto-print to allow the user to review first
    }, 500);
    
    return true;
  } catch (error) {
    console.error('Error printing receipt:', error);
    return false;
  }
};
