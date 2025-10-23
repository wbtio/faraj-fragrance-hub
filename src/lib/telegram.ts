/**
 * Telegram Notification Service
 * Sends notifications to Telegram when new orders are placed
 */

interface TelegramMessage {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerCity?: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  notes?: string;
}

/**
 * Format order details into a nice Telegram message
 */
function formatOrderMessage(message: TelegramMessage): string {
  const { orderNumber, customerName, customerPhone, customerCity, totalAmount, items, notes } = message;

  let text = `🛍️ <b>طلب جديد!</b>\n\n`;
  text += `📋 <b>رقم الطلب:</b> ${orderNumber}\n`;
  text += `👤 <b>اسم العميل:</b> ${customerName}\n`;
  text += `📱 <b>رقم الهاتف:</b> ${customerPhone}\n`;
  
  if (customerCity) {
    text += `🏙️ <b>المدينة:</b> ${customerCity}\n`;
  }
  
  text += `\n📦 <b>المنتجات:</b>\n`;
  items.forEach((item, index) => {
    text += `${index + 1}. ${item.name}\n`;
    text += `   الكمية: ${item.quantity} × ${item.price.toLocaleString()} د.ع\n`;
  });
  
  text += `\n💰 <b>المجموع:</b> ${totalAmount.toLocaleString()} د.ع\n`;
  
  if (notes) {
    text += `\n📝 <b>ملاحظات:</b> ${notes}\n`;
  }
  
  text += `\n⏰ ${new Date().toLocaleString('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`;
  
  return text;
}

/**
 * Send order notification to Telegram
 */
export async function sendTelegramOrderNotification(message: TelegramMessage): Promise<boolean> {
  try {
    // Use hardcoded values for now
    const botToken = '7971557282:AAElLgV_jSAvu3K9BJFwJQyKN-dBZf-lH6U';
    const chatId = '187929059';

    if (!botToken || !chatId) {
      console.warn('⚠️ Telegram bot token or chat ID not configured');
      return false;
    }

    // Format the message
    const text = formatOrderMessage(message);
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    console.log('📤 Sending Telegram notification to:', url);
    console.log('Message content:', text);

    // Send to Telegram
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Telegram API error:', data);
      return false;
    }

    console.log('✅ Telegram notification sent successfully:', data);
    return true;
  } catch (error) {
    console.error('❌ Error sending Telegram notification:', error);
    return false;
  }
}

/**
 * Test Telegram connection
 */
export async function testTelegramConnection(botToken?: string, chatId?: string): Promise<boolean> {
  try {
    const token = botToken || '7971557282:AAElLgV_jSAvu3K9BJFwJQyKN-dBZf-lH6U';
    const chat = chatId || '187929059';

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chat,
        text: '✅ تم الاتصال بنجاح!\n\nبوت تليجرام جاهز لإرسال إشعارات الطلبات.',
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error testing Telegram connection:', error);
    return false;
  }
}

/**
 * Save Telegram settings to localStorage
 */
export function saveTelegramSettings(botToken: string, chatId: string): void {
  localStorage.setItem('telegram_bot_token', botToken);
  localStorage.setItem('telegram_chat_id', chatId);
}

/**
 * Get Telegram settings from localStorage
 */
export function getTelegramSettings(): { botToken: string | null; chatId: string | null } {
  return {
    botToken: localStorage.getItem('telegram_bot_token'),
    chatId: localStorage.getItem('telegram_chat_id'),
  };
}

/**
 * Check if Telegram is configured
 */
export function isTelegramConfigured(): boolean {
  const { botToken, chatId } = getTelegramSettings();
  return !!(botToken && chatId);
}
