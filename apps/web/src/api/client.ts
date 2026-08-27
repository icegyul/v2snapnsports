export interface ApiRequest { operationId: string; authToken?: string; idempotencyKey?: string; }
export interface NormalizedApiError { code: string; requestId?: string; retryable: boolean; }

export class ApiActivationDisabledError extends Error {
  constructor() {
    super("Production API activation is disabled in the V2 foundation.");
    this.name = "ApiActivationDisabledError";
  }
}

export function normalizeApiError(input: { code?: string; requestId?: string }): NormalizedApiError {
  const code = input.code ?? "INTERNAL_ERROR";
  return { code, requestId: input.requestId, retryable: code === "EARTHUS_CONTEXT_UNAVAILABLE" || code === "DEPENDENCY_UNAVAILABLE" || code === "INTERNAL_ERROR" };
}

export function createDisabledApiClient() {
  return { request: async (_request: ApiRequest): Promise<never> => Promise.reject(new ApiActivationDisabledError()) };
}
