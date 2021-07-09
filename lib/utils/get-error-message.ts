import { AmqpError, EventContext } from 'rhea-promise';

export class getErrorMessage {
  public static fromError(error: Error): string {
    return error?.message;
  }

  public static fromReceiver(context: EventContext): string {
    const error = context?.receiver?.error;
    return (error as Error)?.message || (error as AmqpError)?.description;
  }
}
