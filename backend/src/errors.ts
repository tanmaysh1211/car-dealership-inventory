/** An error that maps directly onto an HTTP response. */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}
