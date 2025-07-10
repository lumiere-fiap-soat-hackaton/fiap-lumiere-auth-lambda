import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ServiceProviderException, UnexpectedErrorException } from '../exceptions';

type InputType = { key: string; fileName: string; fileType: string, metadata?: Record<string, string> }
type OutputType = { key: string; fileName: string; presignedUrl: string, metadata?: Record<string, string> }

/** S3 operations handler */
export class StorageService {
  private readonly client = new S3Client();
  private readonly bucketName: string;

  /**
   * Creates a new storage service instance
   * @param bucketName - S3 bucket name (defaults to BUCKET_NAME env var)
   */
  constructor(bucketName: string) {
    this.bucketName = bucketName;

    if (!this.bucketName)
      throw new UnexpectedErrorException('Error instantiating the StorageService: Bucket name is missing');
  }

  /**
   * Generates batch pre-signed upload URLs
   * @param files - File information objects
   * @param expiresIn - URL expiration in seconds
   */
  public async getBatchUploadUrls(files: InputType[], expiresIn = 300): Promise<OutputType[]> {
    try {
      return await Promise.all(
        files.map(file => this.generateUploadUrl(file, expiresIn)),
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generates batch pre-signed download URLs
   * @param files - File information objects
   * @param expiresIn - URL expiration in seconds
   */
  public async getBatchDownloadUrls(files: InputType[], expiresIn = 300): Promise<OutputType[]> {
    try {
      return await Promise.all(
        files.map(file => this.generateDownloadUrl(file, expiresIn)),
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate a pre-signed upload URL for a single file
   * @param file - File information object
   * @param expiresIn - URL expiration time in seconds
   * @returns Object with file name and pre-signed URL
   * @private
   */
  private async generateUploadUrl(file: InputType, expiresIn: number): Promise<OutputType> {
    try {
      const { key, fileName, fileType, metadata } = file;

      const command = new PutObjectCommand({
        Key: key,
        Bucket: this.bucketName,
        ContentType: fileType,
        Metadata: metadata,
      });

      const presignedUrl = await getSignedUrl(this.client, command, { expiresIn });

      return { key, fileName, metadata, presignedUrl };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate a pre-signed download URL for a single file
   * @param file - File information object
   * @param expiresIn - URL expiration time in seconds
   * @returns Object with file name and pre-signed URL
   * @private
   */
  private async generateDownloadUrl(file: InputType, expiresIn: number): Promise<OutputType> {
    try {
      const { key, fileName } = file;

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const presignedUrl = await getSignedUrl(this.client, command, { expiresIn });

      return { key, fileName, presignedUrl };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError = (error: unknown): ServiceProviderException => {
    return new ServiceProviderException((error as Error).message);
  };
}

