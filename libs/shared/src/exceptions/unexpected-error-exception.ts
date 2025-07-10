import { BaseException } from './base-exception';

export class UnexpectedErrorException extends BaseException {
  constructor(reason: string = 'The application encountered an unexpected error.') {
    super('Unexpected application error', 500, reason);
    this.name = 'UnexpectedErrorException';
  }
}