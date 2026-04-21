export class ServiceError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ServiceError";
    this.status = status;
  }
}

export function asServiceError(error: unknown, fallbackMessage: string, fallbackStatus = 500) {
  if (error instanceof ServiceError) {
    return error;
  }

  return new ServiceError(fallbackStatus, fallbackMessage);
}