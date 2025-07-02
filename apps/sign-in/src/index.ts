import { logger } from 'bs-logger';
import { IRequest, IResponse, signInUser } from '@lumiere/shared';

type TPayload = {
  username: string;
  password: string;
};

type TResult = {
  message: string;
};

export const handler = async (event: IRequest<TPayload>): Promise<IResponse<TResult>> => {
  const body: TPayload = JSON.parse(event.body || '{}');
  const { username, password } = body;

  if (!username || !password) {
    logger.error(`Error: Missing, username or password`);

    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing username or password' }),
    };
  }

  const result = await signInUser(username, password);

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
