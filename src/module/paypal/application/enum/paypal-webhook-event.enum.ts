export enum PayPalWebhookEvent {
  CheckoutOrderApproved = 'CHECKOUT.ORDER.APPROVED',
  CheckoutOrderDeclined = 'CHECKOUT.ORDER.DECLINED',
  PaymentCaptureCompleted = 'PAYMENT.CAPTURE.COMPLETED',
  PaymentCaptureDenied = 'PAYMENT.CAPTURE.DENIED',
  PaymentCaptureCancelled = 'PAYMENT.CAPTURE.CANCELLED',
}
