import type { SqlValue } from '@sqlite.org/sqlite-wasm';

/** Metodos que drizzle-orm/sqlite-proxy puede pedirle al driver. */
export type QueryMethod = 'run' | 'all' | 'values' | 'get';

export interface QueryRequest {
  id: number;
  sql: string;
  params: SqlValue[];
  method: QueryMethod;
}

/**
 * drizzle espera las filas como arrays posicionales.
 * Para `get` manda una sola fila plana; para el resto, la lista completa.
 */
export type QueryRows = SqlValue[] | SqlValue[][];

export interface QuerySuccessResponse {
  id: number;
  rows: QueryRows;
}

export interface QueryErrorResponse {
  id: number;
  error: string;
}

export type QueryResponse = QuerySuccessResponse | QueryErrorResponse;

export function isErrorResponse(
  response: QueryResponse,
): response is QueryErrorResponse {
  return 'error' in response;
}
