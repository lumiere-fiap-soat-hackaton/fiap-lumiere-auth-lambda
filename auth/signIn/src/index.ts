import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import {
  AuthService,
  BaseException,
  createAppLogger,
  InvalidInputException,
  UnexpectedErrorException,
} from '@lumiere/shared';

const logger = createAppLogger('SignInFunction');
const clientId = process.env.AUTH_CLIENT_ID as string;
const clientSecret = process.env.AUTH_CLIENT_SECRET as string;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.debug('Received sign-in request', { eventType: 'SignInAttempt', details: { event } });

  try {
    const body = JSON.parse(event.body || '{}');
    const authService = new AuthService(clientId, clientSecret);
    handleValidation(body);

    const result = await authService.signInUser(body.username, body.password);

    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': `accessToken=${result.AccessToken}; Secure; HttpOnly; SameSite=Lax; Path=/`,
      },
      /*multiValueHeaders: {
        'Set-Cookie': [
          `refreshToken=${result.RefreshToken}; Secure; HttpOnly; SameSite=Lax; Max-Age=${result.ExpiresIn * 2}; Path=/`,
          `idToken=${result.IdToken}; Secure; HttpOnly; SameSite=Lax; Max-Age=${result.ExpiresIn}; Path=/`,
          `accessToken=${result.AccessToken}; Secure; HttpOnly; SameSite=Lax; Max-Age=${result.ExpiresIn}; Path=/`,
        ],
      },*/
      body: JSON.stringify({ message: 'User signed in successfully' }),
    };

  } catch (error) {
    const exception = (error instanceof BaseException) ? error : new UnexpectedErrorException(String(error));
    const { message, name, reason, statusCode, stack } = exception;

    logger.error(message, { eventType: name, reason, stack });

    return {
      statusCode: statusCode,
      body: JSON.stringify({ message, errorCode: name }),
    };
  }
};

const handleValidation = (payload: Record<string, string>): void => {
  const { username, password } = payload;
  if (!username || !password) {
    throw new InvalidInputException(`Username and password are required for sign-up creation. 
         username received: ${!!username}, password received : ${!!password}`);
  }
};


