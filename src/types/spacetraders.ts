export interface SpaceTradersErrorResponse {
  error: {
    message: string;
    code: number;
    data?: Record<string, unknown>;
  };
}
