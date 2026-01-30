export class BagsBallError extends Error {
  readonly code: string;
  constructor(code: string, message: string, public readonly cause?: unknown) {
    super(message);
    this.code = code;
  }
}

export function asError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}
