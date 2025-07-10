export abstract class BaseException extends Error {
  public readonly statusCode: number;
  public readonly reason: string;

  protected constructor(message: string, statusCode: number, reason: string) {
    super(message);
    this.name = 'BaseException';
    this.statusCode = statusCode;
    this.reason = reason;
  }
}