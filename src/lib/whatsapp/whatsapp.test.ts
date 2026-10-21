import { describe, it, expect } from 'vitest';
import { getWhatsAppGateway } from './index';
import { ConsoleWhatsAppDriver } from './console.driver';

describe('WhatsApp Gateway Driver Tests', () => {
  it('returns ConsoleWhatsAppDriver by default', () => {
    const gateway = getWhatsAppGateway();
    expect(gateway).toBeInstanceOf(ConsoleWhatsAppDriver);
  });

  it('sends OTP through console driver without errors', async () => {
    const gateway = new ConsoleWhatsAppDriver();
    const result = await gateway.sendOtp('6281234567890', '987654');
    expect(result.success).toBe(true);
    expect(result.messageId).toContain('console-');
  });

  it('sends notification message through console driver without errors', async () => {
    const gateway = new ConsoleWhatsAppDriver();
    const result = await gateway.sendMessage(
      '6281234567890',
      'Halo Pak Joko, stok panen Anda perlu dikonfirmasi.'
    );
    expect(result.success).toBe(true);
    expect(result.messageId).toContain('console-');
  });
});
