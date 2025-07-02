export interface IResponse<T> {
  body?: string & { __type?: T };
  statusCode: number;
  headers?: Record<string, string>;
}
