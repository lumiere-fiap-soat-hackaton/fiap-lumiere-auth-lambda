import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import {
  BaseException,
  createAppLogger,
  InvalidInputException,
  NotAuthorizedException,
  StorageService,
  UnexpectedErrorException,
} from '@lumiere/shared';

enum StorageAction {
  UPLOAD_URL = 'upload-url',
  DOWNLOAD_URL = 'download-url',
}

type FileItem = { fileName: string; fileType: string };

const logger = createAppLogger('StorageUrlFunction');
const bucketName = process.env.BUCKET_NAME as string;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Received storage-url request', { eventType: 'StorageUrlRequestAttempt', details: { event } });

  try {
    logger.debug('Processing storage-url request', { authorizerData: event.requestContext.authorizer });

    const BUCKET_PATHS = {
      [StorageAction.UPLOAD_URL]: 'sources',
      [StorageAction.DOWNLOAD_URL]: 'results',
    };

    const userId = event.requestContext.authorizer?.userId;
    const userEmail = event.requestContext.authorizer?.email ?? '';
    const items = JSON.parse(event.body ?? '[]') as Array<FileItem>;
    const action = (event.pathParameters as { action: StorageAction })?.action ?? null;

    handleValidation(userId, items, action);

    const enhancedItems: Array<FileItem & { key: string }> = items.map((item: FileItem) => {
      const generatedFileKey = `${BUCKET_PATHS[action]}/${userId}/${item.fileName}`;
      return (
        {
          ...item,
          key: generatedFileKey,
          metadata: {
            'user-id': userId,
            'user-email': userEmail,
            'source-file-key': generatedFileKey,
            'source-file-name': item.fileName,
          },
        }
      );
    });

    const storageService = new StorageService(bucketName);

    const strategies = {
      [StorageAction.UPLOAD_URL]: () => storageService.getBatchUploadUrls(enhancedItems),
      [StorageAction.DOWNLOAD_URL]: () => storageService.getBatchDownloadUrls(enhancedItems),
    };

    const result = await strategies[action]();

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

const handleValidation = (userId: string, items: FileItem[], action: StorageAction) => {

  if (!action) {
    throw new InvalidInputException(`URL pathParam for StorageUrl is missing or invalid. (expected: api/storage/{upload-url|download-url}`);
  }
  if (!userId) {
    throw new NotAuthorizedException('User is not authorized to access this resource. Missing or invalid userId.');
  }
  if (!items.length) {
    throw new InvalidInputException('Request body is missing or invalid. Expected a list of file items.');
  }
};