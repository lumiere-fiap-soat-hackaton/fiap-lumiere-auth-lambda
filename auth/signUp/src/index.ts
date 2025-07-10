import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import {
  AuthService,
  BaseException,
  createAppLogger,
  InvalidInputException,
  UnexpectedErrorException,
} from '@lumiere/shared';

enum SignUpAction {
  CREATE = 'create',
  CONFIRM = 'confirm',
}

const logger = createAppLogger('SignUpFunction');
const clientId = process.env.AUTH_CLIENT_ID as string;
const clientSecret = process.env.AUTH_CLIENT_SECRET as string;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.debug('Received sign-up request', { eventType: 'SignUpAttempt', details: { event } });

  try {
    const body = JSON.parse(event.body || '{}');
    const action = (event.pathParameters as { action: SignUpAction })?.action ?? null;
    const authService = new AuthService(clientId, clientSecret);
    const strategies = {
      [SignUpAction.CREATE]: () => authService.signUpUser(body.username, body.password),
      [SignUpAction.CONFIRM]: () => authService.confirmSignUp(body.username, body.verifyCode),
    };

    handleValidation(body, action);

    await strategies[action]();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User signed up successfully' }),
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

const handleValidation = (payload: Record<string, string>, action: SignUpAction): void => {
  const { username, password, verifyCode } = payload;

  if (!action) {
    throw new InvalidInputException(`URL pathParam for SignUp is missing or invalid. (expected: auth/sign-up/{create|confirm}`);
  }

  const validationStrategies = {
    [SignUpAction.CREATE]: () => {
      if (!username || !password) {
        throw new InvalidInputException(`Username and password are required for sign-up creation. 
         username received: ${!!username}, password received : ${!!password}`);
      }
    },
    [SignUpAction.CONFIRM]: () => {
      if (!username || !verifyCode) {
        throw new InvalidInputException(`Username and verification code are required for sign-up confirmation. 
        username received: ${!!username}, verifyCode received: ${!!verifyCode}`);
      }
    },
  };

  validationStrategies[action]();
};
