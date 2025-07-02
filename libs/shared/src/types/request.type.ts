export interface IRequest<T> {
  body?: string & { __type?: T };
  headers?: Record<string, string>;
  httpMethod: string;
  path: string;
}
