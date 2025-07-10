import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { AuthService, BaseException, createAppLogger, getCookie, UnexpectedErrorException } from '@lumiere/shared';

const logger = createAppLogger('SignOutFunction');
const clientId = process.env.AUTH_CLIENT_ID as string;
const clientSecret = process.env.AUTH_CLIENT_SECRET as string;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.debug('Received sign-out request', { eventType: 'SignOutAttempt', details: { event } });

  try {
    const accessToken = handleValidation(event.headers?.Cookie ?? event.headers?.cookie ?? '');
    const authService = new AuthService(clientId, clientSecret);

    if (accessToken) await authService.signOutUser(accessToken);

    return {
      statusCode: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Set-Cookie': 'accessToken=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
      },
      /*multiValueHeaders: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Set-Cookie': [
          `refreshToken=; Secure; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`,
          `idToken=; Secure; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`,
          `accessToken=; Secure; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`,
        ],
      },*/
      body: JSON.stringify({ message: 'User signed out successfully' }),
    };
  } catch (error) {
    const exception = (error instanceof BaseException) ? error : new UnexpectedErrorException(String(error));
    const { message, name, reason, statusCode, stack } = exception;

    logger.error(message, { eventType: name, reason, stack });

    return {
      statusCode: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Set-Cookie': 'accessToken=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
      },
      /*multiValueHeaders: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Set-Cookie': [
          `refreshToken=; Secure; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`,
          `idToken=; Secure; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`,
          `accessToken=; Secure; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`,
        ],
      },*/
      body: JSON.stringify({ message, errorCode: name }),
    };
  }
};

const handleValidation = (headerCookie: string): string | undefined => {
  const accessToken = getCookie(headerCookie, 'accessToken');
  if (!accessToken) {
    logger.warn('No access token found in cookies, skipping authService signOutUser call');
  }
  return accessToken;
};

