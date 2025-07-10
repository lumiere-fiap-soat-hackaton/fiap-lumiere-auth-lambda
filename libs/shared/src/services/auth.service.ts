import { createHmac } from 'crypto';
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  GetTokensFromRefreshTokenCommand,
  GetUserCommand,
  GlobalSignOutCommand,
  InitiateAuthCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { ServiceProviderException, UnexpectedErrorException } from '../exceptions';

type AuthTokens = { AccessToken: string, ExpiresIn: number, TokenType: string, RefreshToken: string, IdToken: string }

/** Cognito operations handler */
export class AuthService {
  private readonly client = new CognitoIdentityProviderClient();
  private readonly clientId: string;
  private readonly clientSecret: string;

  /**
   * Create a new AuthService instance
   * @param clientId Cognito User Pool Client ID
   * @param clientSecret Cognito User Pool Client Secret
   */
  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    if (!this.clientId)
      throw new UnexpectedErrorException('Error instantiating the authService: Client ID is missing');

    if (!this.clientSecret)
      throw new UnexpectedErrorException('Error instantiating the authService: Client Secret is missing');
  }

  /**
   * Create a new unverified user on user pool
   * @param username User's username/email
   * @param password User's password
   */
  public async signUpUser(username: string, password: string): Promise<void> {
    const command = new SignUpCommand({
      ClientId: this.clientId,
      SecretHash: this.createHash(username),
      Username: username,
      Password: password,
      UserAttributes: [{ Name: 'email', Value: username }],
    });

    try {
      await this.client.send(command);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Confirm user's registration with verification code
   * @param username User's username/email
   * @param confirmationCode Verification code sent to user
   */
  public async confirmSignUp(username: string, confirmationCode: string): Promise<void> {
    const command = new ConfirmSignUpCommand({
      ClientId: this.clientId,
      ConfirmationCode: confirmationCode,
      Username: username,
      SecretHash: this.createHash(username),
    });

    try {
      await this.client.send(command);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Initiate user's auth session
   * @param username User's username/email
   * @param password User's password
   * @returns Authentication tokens
   */
  public async signInUser(username: string, password: string): Promise<AuthTokens> {
    const command = new InitiateAuthCommand({
      ClientId: this.clientId,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        PASSWORD: password,
        SECRET_HASH: this.createHash(username),
        USERNAME: username,
      },
    });

    try {
      const { AuthenticationResult = {} } = await this.client.send(command);

      const { AccessToken = '', ExpiresIn = 0, TokenType = '', IdToken = '', RefreshToken = '' } = AuthenticationResult;
      return { AccessToken, ExpiresIn, TokenType, IdToken, RefreshToken };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Refresh user's access token
   * @param refreshToken The refresh token
   * @returns New authentication tokens
   */
  public async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const command = new GetTokensFromRefreshTokenCommand({
      ClientId: this.clientId,
      ClientSecret: this.clientSecret,
      RefreshToken: refreshToken,
    });

    try {
      const { AuthenticationResult = {} } = await this.client.send(command);
      const { AccessToken = '', ExpiresIn = 0, TokenType = '', IdToken = '', RefreshToken = '' } = AuthenticationResult;

      return { AccessToken, ExpiresIn, TokenType, IdToken, RefreshToken };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Fetch user's attributes
   * @param accessToken User's access token
   * @returns User attributes as key-value pairs
   */
  public async fetchUserAttributes(accessToken: string): Promise<Record<string, string>> {
    const command = new GetUserCommand({ AccessToken: accessToken });

    try {
      const { UserAttributes = [] } = await this.client.send(command);

      return (UserAttributes).reduce((acc, { Name = '', Value = '' }) => {
        acc[Name] = Value;
        return acc;
      }, {} as Record<string, string>);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Revoke user's auth session
   * @param accessToken User's access token
   */
  public async signOutUser(accessToken: string): Promise<void> {
    const command = new GlobalSignOutCommand({ AccessToken: accessToken });

    try {
      await this.client.send(command);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a hash using HMAC SHA256
   * @param username User's username/email
   * @returns Base64 encoded hash
   */
  private createHash(username: string): string {
    return createHmac('sha256', this.clientSecret)
      .update(`${username}${this.clientId}`)
      .digest('base64');
  }

  private handleError = (error: unknown): ServiceProviderException => {
    return new ServiceProviderException((error as Error).message);
  };
}
