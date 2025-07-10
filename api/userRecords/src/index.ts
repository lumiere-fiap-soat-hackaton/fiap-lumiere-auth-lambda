import { logger } from 'bs-logger';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BaseException, NotAuthorizedException, UnexpectedErrorException } from '@lumiere/shared';

enum RecordStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

type TRecord = {
  id: string;
  sourceFileKey: string;
  sourceFileName: string;
  resultFileKey: string | null;
  resultFileName: string | null;
  status: keyof typeof RecordStatus;
  createdAt: string;
  updatedAt: string | null;
};

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.debug('Received user-records request', { eventType: 'GetUserRecordsAttempt', details: { event } });

  try {
    const userId = event.requestContext.authorizer?.userId;
    const statuses = (event.queryStringParameters as { statuses: RecordStatus })?.statuses?.split(',') ?? null;

    handleValidation(userId);

    const response = statuses?.length ? responseMock.filter((record) => statuses?.includes(record.status)) : responseMock;

    return {
      statusCode: 200,
      body: JSON.stringify(response),
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

const handleValidation = (userId: string) => {
  if (!userId) {
    throw new NotAuthorizedException('User is not authorized to access this resource. Missing or invalid userId.');
  }
};

const responseMock: Array<TRecord> = [
  {
    id: 'a2f8e631-e32b-4a89-a92f-6e756a5432d1',
    sourceFileKey: 'sources/abc-123/1718832000000-video1.mp4',
    sourceFileName: 'video1.mp4',
    resultFileKey: 'results/abc-123/1718832000000-video1.mp4.zip',
    resultFileName: 'video1.mp4.zip',
    status: 'COMPLETED',
    createdAt: '2024-06-20T15:00:00Z',
    updatedAt: '2024-06-20T15:03:20Z',
  },
  {
    id: 'b7c5d902-1a4f-48e7-b83e-9d25f8e63c04',
    sourceFileKey: 'sources/abc-123/1718835600000-video2.mp4',
    sourceFileName: 'video2.mp4',
    resultFileKey: null,
    resultFileName: null,
    status: 'PENDING',
    createdAt: '2024-06-20T16:00:00Z',
    updatedAt: null,
  },
  {
    id: 'c9e2a1b8-7d56-4f3c-9810-42a8e7d93b15',
    sourceFileKey: 'sources/abc-123/1718839200000-video3.mp4',
    sourceFileName: 'video3.mp4',
    resultFileKey: null,
    resultFileName: null,
    status: 'FAILED',
    createdAt: '2024-06-20T17:00:00Z',
    updatedAt: '2024-06-20T17:05:22Z',
  },
  {
    id: 'd1f4c6e3-5b2a-48d9-a73e-6c94f5b21d87',
    sourceFileKey: 'sources/abc-123/1718842800000-palestra.mp4',
    sourceFileName: 'palestra.mp4',
    resultFileKey: 'results/abc-123/1718842800000-palestra.mp4.zip',
    resultFileName: 'palestra.mp4.zip',
    status: 'COMPLETED',
    createdAt: '2024-06-20T18:00:00Z',
    updatedAt: '2024-06-20T18:05:40Z',
  },
  {
    id: 'e5a8d2f7-9c3b-47e6-b52d-8f1e3c7a9456',
    sourceFileKey: 'sources/abc-123/1718846400000-aula01.mp4',
    sourceFileName: 'aula01.mp4',
    resultFileKey: null,
    resultFileName: null,
    status: 'PENDING',
    createdAt: '2024-06-20T19:00:00Z',
    updatedAt: null,
  },
  {
    id: 'f2e1d3c5-6a8b-49f7-b0a9-7c4e5d2f1b83',
    sourceFileKey: 'sources/abc-123/1718850000000-apresentacao-final.mp4',
    sourceFileName: 'apresentacao-final.mp4',
    resultFileKey: 'results/abc-123/1718850000000-apresentacao-final.mp4.zip',
    resultFileName: 'apresentacao-final.mp4.zip',
    status: 'COMPLETED',
    createdAt: '2024-06-20T20:00:00Z',
    updatedAt: '2024-06-20T20:02:00Z',
  },
  {
    id: 'g7h9j2k4-5l6m-4n8p-q1r2-s3t5u7v9w0x0',
    sourceFileKey: 'sources/abc-123/1718853600000-depoimento.mp4',
    sourceFileName: 'depoimento.mp4',
    resultFileKey: null,
    resultFileName: null,
    status: 'FAILED',
    createdAt: '2024-06-20T21:00:00Z',
    updatedAt: '2024-06-20T21:05:00Z',
  },
];