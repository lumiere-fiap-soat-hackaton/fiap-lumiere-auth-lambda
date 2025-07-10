import { BaseException } from './base-exception';

export class NotAuthorizedException extends BaseException {
  constructor(reason: string = 'Authentication credentials are missing or invalid.') {
    super('Invalid or expired access token', 401, reason);
    this.name = 'NotAuthorizedException';
  }
}