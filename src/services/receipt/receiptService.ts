
import { Sale } from "@/utils/models";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { getCurrency } from "@/context/CurrencyContext";

export const printReceipt = (sale: Sale, companyInfo?: any) => {
  try {
    console.log("Generating receipt for sale:", sale);
    
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) {
      console.error("Failed to open receipt window. Please allow pop-ups.");
      toast({
        title: "خطأ في الطباعة",
        description: "فشل فتح نافذة الإيصال. الرجاء السماح بالنوافذ المنبثقة.",
        variant: "destructive",
      });
      return;
    }
    
    // Get the current currency from localStorage
    const currentCurrency = getCurrency();
    // Get the exchange rate from localStorage or use default
    const exchangeRate = parseFloat(localStorage.getItem("exchangeRate") || "1450");
    
    // Format total based on currency
    let formattedTotal;
    
    if (currentCurrency === 'USD') {
      // If currency is USD but sale was recorded in IQD, convert back
      const totalInUsd = sale.currency === 'IQD' ? 
        Math.round((sale.total_amount / exchangeRate) * 100) / 100 : 
        sale.total_amount;
      formattedTotal = totalInUsd.toFixed(2);
    } else {
      // If currency is IQD but sale was recorded in USD, convert
      const totalInIqd = sale.currency === 'USD' ? 
        Math.round(sale.total_amount * exchangeRate) : 
        sale.total_amount;
      formattedTotal = Math.round(totalInIqd).toLocaleString();
    }
    
    receiptWindow.document.write(`
      <html dir="rtl">
      <head>
        <title>إيصال رقم ${sale.id.substring(0, 8)}</title>
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
        </style>
      </head>
      <body>
        <div class="header">
          ${companyInfo ? `<h1>${companyInfo.name || 'إيصال مبيعات'}</h1>` : '<h1>إيصال مبيعات</h1>'}
          <p>رقم المبيعة: ${sale.id.substring(0, 8)}</p>
          <p>تاريخ: ${format(new Date(sale.created_at), 'yyyy/MM/dd hh:mm a', { locale: ar })}</p>
          <p>العملة: ${currentCurrency === 'USD' ? 'دولار أمريكي ($)' : 'دينار عراقي (د.ع)'}</p>
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
            <p><strong>إجمالي المبلغ:</strong> ${formattedTotal} ${currentCurrency === 'USD' ? '$' : 'د.ع'}</p>
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
            ${sale.items.map(item => {
              // Format item prices based on currency
              let itemUnitPrice, itemTotalPrice;
              
              if (currentCurrency === 'USD') {
                // Convert if needed
                const unitPriceUSD = sale.currency === 'IQD' ? 
                  Math.round((item.unit_price / exchangeRate) * 100) / 100 : 
                  item.unit_price;
                
                const totalPriceUSD = sale.currency === 'IQD' ? 
                  Math.round((item.total_price / exchangeRate) * 100) / 100 : 
                  item.total_price;
                
                itemUnitPrice = `$${unitPriceUSD.toFixed(2)}`;
                itemTotalPrice = `$${totalPriceUSD.toFixed(2)}`;
              } else {
                // Convert if needed
                const unitPriceIQD = sale.currency === 'USD' ? 
                  Math.round(item.unit_price * exchangeRate) : 
                  item.unit_price;
                
                const totalPriceIQD = sale.currency === 'USD' ? 
                  Math.round(item.total_price * exchangeRate) : 
                  item.total_price;
                
                itemUnitPrice = `${Math.round(unitPriceIQD).toLocaleString()} د.ع`;
                itemTotalPrice = `${Math.round(totalPriceIQD).toLocaleString()} د.ع`;
              }
              
              return `
              <tr>
                <td>${item.product_name}</td>
                <td>${item.quantity}</td>
                <td>${itemUnitPrice}</td>
                <td>${itemTotalPrice}</td>
              </tr>
            `}).join('')}
          </tbody>
        </table>
        
        <div class="total">
          الإجمالي: ${formattedTotal} ${currentCurrency === 'USD' ? '$' : 'د.ع'}
        </div>
        
        <div class="footer">
          ${companyInfo ? `<p>${companyInfo.name || 'شكراً لتعاملكم معنا'}</p>` : '<p>شكراً لتعاملكم معنا</p>'}
          <p>هذا الإيصال دليل على عملية الشراء</p>
        </div>
      </body>
      </html>
    `);
    
    receiptWindow.document.close();
  } catch (error) {
    console.error("Error generating receipt:", error);
    toast({
      title: "خطأ في الطباعة",
      description: "حدث خطأ أثناء توليد الإيصال. يرجى المحاولة مرة أخرى.",
      variant: "destructive",
    });
  }
};
