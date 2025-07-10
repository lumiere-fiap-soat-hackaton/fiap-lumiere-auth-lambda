import { BaseException } from './base-exception';

export class InvalidInputException extends BaseException {
  constructor(reason: string = 'The input provided does not meet the required format or constraints.') {
    super('Invalid user input error', 400, reason);
    this.name = 'InvalidInputException';
  }
}