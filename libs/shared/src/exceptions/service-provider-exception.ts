import { BaseException } from './base-exception';

export class ServiceProviderException extends BaseException {
  constructor(reason: string = 'An error occurred while processing the service provider operation.') {
    super('A provider operation has failed', 500, reason);
    this.name = 'ServiceProviderException';
  }
}