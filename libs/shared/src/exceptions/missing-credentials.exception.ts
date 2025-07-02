export class MissingCredentialsException extends Error {
  constructor(message = 'Username and password are required') {
    super(message);
    this.name = 'MissingCredentialsException';
  }
}
