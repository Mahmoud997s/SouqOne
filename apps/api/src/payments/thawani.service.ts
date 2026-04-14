import { Injectable, Logger } from '@nestjs/common';

interface ThawaniSessionParams {
  clientReferenceId: string;
  products: { name: string; quantity: number; unit_amount: number }[];
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

interface ThawaniSession {
  session_id: string;
  publish_key: string;
  invoice: string;
  payment_status: string;
}

@Injectable()
export class ThawaniService {
  private readonly logger = new Logger(ThawaniService.name);
  private readonly apiUrl: string;
  private readonly secretKey: string;
  readonly publishableKey: string;

  constructor() {
    this.apiUrl = process.env.THAWANI_API_URL || 'https://uatcheckout.thawani.om/api/v1';
    this.secretKey = process.env.THAWANI_SECRET_KEY || '';
    this.publishableKey = process.env.THAWANI_PUBLISHABLE_KEY || '';
  }

  async createSession(params: ThawaniSessionParams): Promise<ThawaniSession> {
    const res = await fetch(`${this.apiUrl}/checkout/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'thawani-api-key': this.secretKey,
      },
      body: JSON.stringify({
        client_reference_id: params.clientReferenceId,
        products: params.products,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: params.metadata,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`Thawani createSession failed: ${err}`);
      throw new Error(`Thawani API error: ${res.status}`);
    }

    const body = (await res.json()) as { data: ThawaniSession };
    return body.data;
  }

  async getSession(sessionId: string): Promise<ThawaniSession> {
    const res = await fetch(`${this.apiUrl}/checkout/session/${sessionId}`, {
      headers: { 'thawani-api-key': this.secretKey },
    });

    if (!res.ok) {
      throw new Error(`Thawani getSession failed: ${res.status}`);
    }

    const body = (await res.json()) as { data: ThawaniSession };
    return body.data;
  }

  getCheckoutUrl(sessionId: string): string {
    const base = this.apiUrl.includes('uat') ? 'https://uatcheckout.thawani.om' : 'https://checkout.thawani.om';
    return `${base}/pay/${sessionId}?key=${this.publishableKey}`;
  }
}
