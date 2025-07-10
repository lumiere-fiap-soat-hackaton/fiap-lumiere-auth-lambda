import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import {
  AuthService,
  BaseException,
  createAppLogger,
  getCookie,
  NotAuthorizedException,
  UnexpectedErrorException,
} from '@lumiere/shared';

const logger = createAppLogger('UserDataFunction');
const clientId = process.env.AUTH_CLIENT_ID as string;
const clientSecret = process.env.AUTH_CLIENT_SECRET as string;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.debug('Received useData request', { eventType: 'RequestUserDataAttempt', details: { event } });

  try {
    const accessToken = handleValidation(event.headers?.Cookie ?? event.headers?.cookie ?? '');
    const authService = new AuthService(clientId, clientSecret);
    const result = await authService.fetchUserAttributes(accessToken);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
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

const handleValidation = (headerCookie: string): string => {
  const accessToken = getCookie(headerCookie, 'accessToken');
  if (!accessToken)
    throw new NotAuthorizedException();

  return accessToken;
};
