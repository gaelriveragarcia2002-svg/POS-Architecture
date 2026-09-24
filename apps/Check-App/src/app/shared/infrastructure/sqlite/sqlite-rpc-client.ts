import {
  isErrorResponse,
  type QueryMethod,
  type QueryRequest,
  type QueryResponse,
  type QueryRows,
} from './worker-protocol';

export interface SqliteClient {
  execute(
    sql: string,
    params: QueryRequest['params'],
    method: QueryMethod,
    rowMode?: QueryRequest['rowMode'],
  ): Promise<QueryRows>;
}

interface PendingQuery {
  resolve: (rows: QueryRows) => void;
  reject: (error: Error) => void;
}

/**
 * RPC de bajo nivel hacia el worker de SQLite: manda SQL crudo y no sabe
 * nada de drizzle ni de ninguna tabla en particular. El cliente drizzle
 * compartido se arma encima de este cliente en SQLITE_DB (ver
 * shared/infrastructure/sqlite/sqlite-db.ts).
 */
export function createSqliteClient(worker: Worker): SqliteClient {
  let counter = 0;
  const pending = new Map<number, PendingQuery>();

  // Si el worker se cae (wasm que no carga, error de sintaxis, etc.) hay que
  // liberar lo que este en vuelo; si no, cada query queda colgada para siempre.
  const failAll = (error: Error) => {
    for (const { reject } of pending.values()) reject(error);
    pending.clear();
  };

  worker.onmessage = ({ data }: MessageEvent<QueryResponse>) => {
    const query = pending.get(data.id);
    if (!query) return;
    pending.delete(data.id);

    if (isErrorResponse(data)) query.reject(new Error(data.error));
    else query.resolve(data.rows);
  };

  worker.onerror = (event) =>
    failAll(new Error(`sqlite worker: ${event.message || 'fallo al cargar'}`));
  worker.onmessageerror = () =>
    failAll(new Error('sqlite worker: no se pudo deserializar el mensaje'));

  return {
    execute(sql, params, method, rowMode) {
      const id = counter++;
      return new Promise<QueryRows>((resolve, reject) => {
        pending.set(id, { resolve, reject });
        worker.postMessage({ id, sql, params, method, rowMode } satisfies QueryRequest);
      });
    },
  };
}
