export type Auth = {
  readonly accessToken: string;
};
export type AuthError = {
  readonly message: string;

  readonly statusCode: number;
};

export enum ApiOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}
