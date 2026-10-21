export interface IWhatsAppGateway {
  sendOtp(phoneNumber: string, code: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendMessage(phoneNumber: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
}
