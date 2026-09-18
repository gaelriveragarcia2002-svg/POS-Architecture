import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from './schema';
import {
  isErrorResponse,
  type QueryRequest,
  type QueryResponse,
  type QueryRows,
} from './worker-protocol';

interface PendingQuery {
  resolve: (rows: QueryRows) => void;
  reject: (error: Error) => void;
}

export function createDb(worker: Worker) {
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

  return drizzle(
    async (sql, params, method) => {
      const id = counter++;
      const rows = await new Promise<QueryRows>((resolve, reject) => {
        pending.set(id, { resolve, reject });
        worker.postMessage({ id, sql, params, method } satisfies QueryRequest);
      });
      return { rows };
    },
    { schema },
  );
}
