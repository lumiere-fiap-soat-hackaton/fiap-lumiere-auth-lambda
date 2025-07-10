import { APIGatewayRequestAuthorizerEvent, APIGatewayRequestAuthorizerHandler } from 'aws-lambda';
import {
  AuthService,
  BaseException,
  createAppLogger,
  getCookie,
  NotAuthorizedException,
  UnexpectedErrorException,
} from '@lumiere/shared';
import { APIGatewayAuthorizerResult } from 'aws-lambda/trigger/api-gateway-authorizer';

const logger = createAppLogger('AuthorizerFunction');
const clientId = process.env.AUTH_CLIENT_ID as string;
const clientSecret = process.env.AUTH_CLIENT_SECRET as string;

export const handler: APIGatewayRequestAuthorizerHandler = async (event: APIGatewayRequestAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  logger.debug('Received authorization request', { eventType: 'RequestAuthorizationAttempt', details: { event } });

  try {
    const accessToken = handleValidation(event.headers?.Cookie ?? event.headers?.cookie ?? '');
    const authService = new AuthService(clientId, clientSecret);
    const result = await authService.fetchUserAttributes(accessToken);

    return {
      principalId: result.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*',
          },
        ],
      },
      context: {
        scope: 'user',
        userId: result.sub,
        email: result.email,

      },
    };

  } catch (error) {
    const exception = (error instanceof BaseException) ? error : new UnexpectedErrorException(String(error));
    const { message, name, reason, stack } = exception;

    logger.error(message, { eventType: name, reason, stack });

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*',
          },
        ],
      },
    };
  }
};

const handleValidation = (headerCookie: string): string => {
  const accessToken = getCookie(headerCookie, 'accessToken');
  if (!accessToken)
    throw new NotAuthorizedException();

  return accessToken;
};