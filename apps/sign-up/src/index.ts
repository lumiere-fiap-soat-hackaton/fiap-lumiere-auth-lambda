import { logger } from 'bs-logger';
import { IRequest, IResponse, signUpUser } from '@lumiere/shared';

type TPayload = {
  email: string;
  username: string;
  password: string;
};

type TResult = {
  message: string;
};

export const handler = async (event: IRequest<TPayload>): Promise<IResponse<TResult>> => {
  const body: TPayload = JSON.parse(event.body || '{}');
  const { email, username, password } = body;

  if (!email || !username || !password) {
    logger.error(`Error: Missing email, username or password`);

    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing email, username or password' }),
    };
  }

  const result = await signUpUser(email, username, password);

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
