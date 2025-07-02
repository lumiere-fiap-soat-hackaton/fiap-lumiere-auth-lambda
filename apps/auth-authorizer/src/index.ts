import { logger } from 'bs-logger';
import axios from 'axios';
import qs from 'qs';
import { APIGatewayProxyHandler } from 'aws-lambda';

interface IRequest<T> {
  queryStringParameters: T | null;
}

interface IResponse<T> {
  body: string & { __type?: T };
  headers: Record<string, string>;
  statusCode: number;
}

type TParams = {
  code?: string;
};

type TResult = {};

const CLIENT_ID = process.env.COGNITO_APP_CLIENT_ID as string;
const DOMAIN = process.env.COGNITO_DOMAIN as string;
const CALLBACK_URL = process.env.AUTH_CALLBACK_URL as string;

export const handler: APIGatewayProxyHandler = async (event: IRequest<TParams>): Promise<IResponse<TResult>> => {
  const code = event.queryStringParameters?.code;

  if (!code) {
    logger.error(`Error: Missing authorization code`);
    return {
      headers: { contentType: 'application/json' },
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing authorization code query param' }),
    };
  }

  const data = {
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    // The redirect has already happened, but you still need to pass the URI
    // for validation, so a valid oAuth2 access token can be generated
    redirect_uri: encodeURI(CALLBACK_URL),
    code: code,
  };

  // Every Cognito instance has its own token endpoints. For more information
  // check the documentation: https://docs.aws.amazon.com/cognito/latest/developerguide/token-endpoint.html
  const res = await axios.post(`${DOMAIN}/oauth2/token`,
    qs.stringify(data),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  return {
    statusCode: 302,
    // These headers are returned as part of the response to the browser.
    headers: {
      // The Location header tells the browser it should redirect to the root of the URL
      Location: '/',
      // The Set-Cookie header tells the browser to persist the access token in the cookie store
      'Set-Cookie': `accessToken=${res.data.access_token}; Secure; HttpOnly; SameSite=Lax; Path=/`,
    },
    body: JSON.stringify({ message: 'Authorization successful, redirecting...' }),
  };
};
