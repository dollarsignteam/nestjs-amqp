import { AmqpError, EventContext, Message } from 'rhea-promise';

import { getLogger } from '../utils';

export class MessageControl {
  private readonly logger = getLogger(MessageControl.name);
  private handled = false;

  constructor(private readonly eventContext: EventContext) {}

  /**
   * Use `accept` when message has been handled normally.
   *
   * NOTE: When no explicit `accept` / `reject` / `release` call has been made
   * in the callback, message will be automatically accepted.
   */
  public accept(): void {
    if (this.handled) {
      this.logger.debug('message already handled');
      return;
    }
    this.logger.debug('accepting message');
    this.eventContext.delivery.accept();
    this.handleSettlement();
  }

  /**
   * Use `reject` when message was un processable. It contained either malformed
   * or semantically incorrect data. In other words it can't be successfully
   * processed in the future without modifications.
   *
   * NOTE: With ActiveMQ `reject` will result in the same retry cycle as the
   * `release` settlement due to technical limitations. Regardless, please
   * always use the appropriate settlement.
   *
   */
  public reject(reason: string | Record<string, unknown>): void {
    if (this.handled) {
      this.logger.debug('message already handled');

      return;
    }

    this.logger.debug(`rejecting message with reason: ${reason.toString()}`);

    // condition and description will not be displayed anywhere
    const error: AmqpError = {
      condition: 'amqp:precondition-failed',
      description: this.getRejectReason(reason),
    };

    this.eventContext.delivery.reject(error);
    this.handleSettlement();
  }

  /**
   * Use release when a temporary problem happened during message handling, e.g.
   * could not save record to DB, 3rd party service errored, etc. The message is
   * not malformed and theoretically can be processed at a later time without
   * modifications.
   *
   * NOTE: with ActiveMQ `release` will result in the same retry cycle as the
   * `reject` settlement due to technical limitations. Regardless, please
   * always use the appropriate settlement.
   */
  public release(): void {
    if (this.handled) {
      this.logger.debug('message already handled');

      return;
    }

    this.logger.debug('releasing message');

    // NOTE: need to be handled this way to trigger retry logic
    this.eventContext.delivery.release({
      undeliverable_here: true,
      delivery_failed: false,
    });
    this.handleSettlement();
  }

  public isHandled(): boolean {
    return this.handled;
  }

  public get context(): EventContext {
    return this.eventContext;
  }

  public get message(): Message {
    return this.eventContext?.message;
  }

  private handleSettlement(): void {
    // need to add a credit after successful handling
    this.eventContext.receiver.addCredit(1);

    // set as already handled
    this.handled = true;
  }

  private getRejectReason(reason: string | Record<string, unknown>): string {
    try {
      return typeof reason !== 'string' ? JSON.stringify(reason) : reason;
    } catch (error) {
      this.logger.debug(`could not parse error reason: ${reason}`);

      return 'unknown';
    }
  }
}
