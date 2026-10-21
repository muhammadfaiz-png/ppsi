import { IWhatsAppGateway } from './gateway.interface';
import { ConsoleWhatsAppDriver } from './console.driver';
import { FonnteWhatsAppDriver } from './fonnte.driver';

let gatewayInstance: IWhatsAppGateway | null = null;

export function getWhatsAppGateway(): IWhatsAppGateway {
  if (gatewayInstance) return gatewayInstance;

  const driver = process.env.WA_GATEWAY_DRIVER || 'console';

  if (driver.toLowerCase() === 'fonnte') {
    gatewayInstance = new FonnteWhatsAppDriver();
  } else {
    gatewayInstance = new ConsoleWhatsAppDriver();
  }

  return gatewayInstance;
}

export * from './gateway.interface';
export * from './console.driver';
export * from './fonnte.driver';
