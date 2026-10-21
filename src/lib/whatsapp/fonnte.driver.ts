import { IWhatsAppGateway } from './gateway.interface';

export class FonnteWhatsAppDriver implements IWhatsAppGateway {
  private token: string;

  constructor(token?: string) {
    this.token = token || process.env.FONNTE_TOKEN || '';
    if (!this.token && process.env.NODE_ENV === 'production') {
      console.warn('[Fonnte Driver] Peringatan: FONNTE_TOKEN belum disetel di environment.');
    }
  }

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0')) return '62' + digits.slice(1);
    if (digits.startsWith('62')) return digits;
    return '62' + digits;
  }

  async sendOtp(phoneNumber: string, code: string) {
    const text = `[Way Kanan Agro] Kode verifikasi Anda adalah: ${code}. Berlaku selama 5 menit. Jangan bagikan kode ini kepada siapapun.`;
    return this.sendMessage(phoneNumber, text);
  }

  async sendMessage(phoneNumber: string, message: string) {
    const target = this.normalizePhone(phoneNumber);

    try {
      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          Authorization: this.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target,
          message,
          countryCode: '62',
        }),
      });

      const data = await response.json();
      if (!response.ok || data.status === false) {
        return {
          success: false,
          error: data.reason || 'Gagal mengirim pesan melalui Fonnte',
        };
      }

      return {
        success: true,
        messageId: String(data.id || Date.now()),
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Kesalahan jaringan API Fonnte';
      return { success: false, error: errorMsg };
    }
  }
}
