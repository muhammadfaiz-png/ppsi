import { IWhatsAppGateway } from './gateway.interface';

// In-memory record for test inspection and debugging
export const consoleSentMessages: Array<{
  phoneNumber: string;
  type: 'otp' | 'message';
  content: string;
  sentAt: Date;
}> = [];

export class ConsoleWhatsAppDriver implements IWhatsAppGateway {
  async sendOtp(phoneNumber: string, code: string) {
    const text = `[Way Kanan Agro] Kode masuk Anda adalah: ${code}. Berlaku 5 menit. JANGAN berikan kode ini kepada siapapun demi keamanan akun Anda.`;
    
    console.log('\n======================================================');
    console.log('📱 [WHATSAPP GATEWAY - DEV CONSOLE]');
    console.log(`Kepada: ${phoneNumber}`);
    console.log(`Pesan : ${text}`);
    console.log(`KODE OTP: >>> ${code} <<<`);
    console.log('======================================================\n');

    consoleSentMessages.push({
      phoneNumber,
      type: 'otp',
      content: code,
      sentAt: new Date(),
    });

    return { success: true, messageId: `console-${Date.now()}` };
  }

  async sendMessage(phoneNumber: string, message: string) {
    console.log('\n======================================================');
    console.log('📱 [WHATSAPP GATEWAY - NOTIFIKASI]');
    console.log(`Kepada: ${phoneNumber}`);
    console.log(`Isi   : ${message}`);
    console.log('======================================================\n');

    consoleSentMessages.push({
      phoneNumber,
      type: 'message',
      content: message,
      sentAt: new Date(),
    });

    return { success: true, messageId: `console-${Date.now()}` };
  }
}
