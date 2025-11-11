export interface SpaceTradersErrorResponse {
  error: {
    code: number;
    data?: Record<string, unknown>;
    message: string;
  };
}
