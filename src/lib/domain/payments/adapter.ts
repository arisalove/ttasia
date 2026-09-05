import type { PaymentMethod } from '../types';
import type { Sen } from '../../utils/money';

/**
 * Modular payment adapter interface. The MVP ships "manual" methods (bank
 * transfer with receipt upload, cash on delivery, cash on pickup) via
 * ManualPaymentAdapter. A real gateway (FPX, etc.) implements the same
 * interface and is selected by `PAYMENT_PROVIDER` in env — no call sites
 * elsewhere in the app need to change.
 *
 * IMPORTANT: in demo mode (or with the manual adapter) TapTap must never
 * claim that a payment has actually been processed/captured — only that a
 * receipt or intent was recorded, pending human/supplier review.
 */
export interface PaymentIntentRequest {
  orderId: string;
  amountSen: Sen;
  method: PaymentMethod;
}

export interface PaymentIntentResult {
  provider: 'manual' | 'fpx';
  status: 'awaiting_receipt' | 'awaiting_fulfilment' | 'redirect_required';
  /** For real gateways: where to redirect the buyer. Manual adapter never sets this. */
  redirectUrl?: string;
  message: string;
}

export interface PaymentAdapter {
  readonly provider: 'manual' | 'fpx';
  createIntent(req: PaymentIntentRequest): Promise<PaymentIntentResult>;
}

export class ManualPaymentAdapter implements PaymentAdapter {
  readonly provider = 'manual' as const;

  async createIntent(req: PaymentIntentRequest): Promise<PaymentIntentResult> {
    if (req.method === 'bank_transfer') {
      return {
        provider: 'manual',
        status: 'awaiting_receipt',
        message:
          'This is demo mode: no real money moves. Please upload proof of bank transfer for the supplier to verify.',
      };
    }
    return {
      provider: 'manual',
      status: 'awaiting_fulfilment',
      message: `This is demo mode: no real money moves. Pay by cash ${
        req.method === 'cod' ? 'on delivery' : 'on pickup'
      }.`,
    };
  }
}

/**
 * Stub for a future FPX (or other Malaysian gateway) integration. Left
 * unimplemented on purpose — wire up the provider's SDK/API here and it
 * slots in behind the same PaymentAdapter interface.
 */
export class FpxPaymentAdapter implements PaymentAdapter {
  readonly provider = 'fpx' as const;

  async createIntent(_req: PaymentIntentRequest): Promise<PaymentIntentResult> {
    throw new Error(
      'FPX is not yet configured for this deployment. Set PAYMENT_PROVIDER=manual, or implement FpxPaymentAdapter.',
    );
  }
}

export function getPaymentAdapter(): PaymentAdapter {
  const provider = process.env.PAYMENT_PROVIDER ?? 'manual';
  return provider === 'fpx' ? new FpxPaymentAdapter() : new ManualPaymentAdapter();
}
