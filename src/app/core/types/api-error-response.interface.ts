export interface IApiErrorResponse {
  error: {
    code: number;
    timestamp: string;
    path: string;
    method: string;
    message: string[] | string;
  };
}
