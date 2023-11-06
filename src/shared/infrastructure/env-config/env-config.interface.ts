export interface IEnvConfig {
  getAppPort(): number;
  getNodeEnv(): string;
  getJwtSecret(): string;
  getJwtExpiresInSeconds(): number;
}
