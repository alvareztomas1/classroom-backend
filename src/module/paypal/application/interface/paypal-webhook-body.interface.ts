import { PayPalWebhookEvent } from '@paypal/application/enum/paypal-webhook-event.enum';

export interface IPaypalWebhookVerifyPayload {
  auth_algo: string;
  cert_url: string;
  transmission_id: string;
  transmission_sig: string;
  transmission_time: string;
  webhook_id: string;
  webhook_event: IPaypalWebhookBody;
}

export interface IPaypalWebhookBody {
  event_type: PayPalWebhookEvent;
  resource: IPayPalOrderResource | IPayPalCaptureResource;
}

export interface IPayPalCaptureResource {
  id: string;
  status: string;
  amount?: Record<string, unknown>;
  supplementary_data?: IPayPalSupplementaryData;
}

export interface IPayPalOrderResource {
  id: string;
  status: string;
}

interface IPayPalRelatedIds {
  order_id: string;
}

interface IPayPalSupplementaryData {
  related_ids: IPayPalRelatedIds;
}
