import type { SqlValue } from '@sqlite.org/sqlite-wasm';

/** Metodos que drizzle-orm/sqlite-proxy puede pedirle al driver. */
export type QueryMethod = 'run' | 'all' | 'values' | 'get';

export interface QueryRequest {
  id: number;
  sql: string;
  params: SqlValue[];
  method: QueryMethod;
  /**
   * 'array' (default): filas posicionales — lo que necesita drizzle.
   * 'object': filas como { columna: valor }, con nombres de columna reales
   * — solo lo usa la consola de debug (ver sqlite-console.page.component),
   * nunca un adapter de drizzle. Ignorado si `method` es 'get'.
   */
  rowMode?: 'array' | 'object';
}

/**
 * drizzle espera las filas como arrays posicionales (rowMode 'array', el
 * default). Para `get` manda una sola fila plana; para el resto, la lista
 * completa. rowMode 'object' devuelve filas con nombre de columna.
 */
export type QueryRows = SqlValue[] | SqlValue[][] | Record<string, SqlValue>[];

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
