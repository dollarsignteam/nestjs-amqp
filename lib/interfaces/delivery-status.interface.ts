import { Delivery } from 'rhea-promise';

export interface DeliveryStatus {
  delivery?: Delivery;
  error?: Error;
  status: boolean;
}
