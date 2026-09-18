/// <reference lib="webworker" />
import sqlite3InitModule, { type OpfsDatabase } from '@sqlite.org/sqlite-wasm';
import type {
  QueryErrorResponse,
  QueryRequest,
  QueryRows,
  QuerySuccessResponse,
} from './worker-protocol';

let db: OpfsDatabase;

// * Funcion de inicializacion de DB. Generico: no conoce tablas de ninguna
// feature — cada adaptador de infraestructura migra su propio esquema
// mandando su propio CREATE TABLE por el mismo canal de queries.
async function initDb(): Promise<void> {
  const sqlite3 = await sqlite3InitModule();

  // El VFS de OPFS solo se instala si la pagina es cross-origin isolated
  // (headers COOP/COEP). Sin eso, oo1.OpfsDb ni siquiera existe.
  if (!('OpfsDb' in sqlite3.oo1)) {
    throw new Error(
      'El VFS de OPFS no esta disponible. La pagina debe servirse con los headers ' +
        'Cross-Origin-Opener-Policy: same-origin y Cross-Origin-Embedder-Policy: require-corp.',
    );
  }

  // OpfsDb requiere que el worker tenga acceso síncrono al OPFS
  db = new sqlite3.oo1.OpfsDb('/app.sqlite3');
}

// Se lanza una sola vez; cada query espera a que termine.
const ready = initDb();

// * Listener de evento
addEventListener('message', async (event: MessageEvent<QueryRequest>) => {
  const { id, sql, params, method, rowMode } = event.data;

  try {
    // Dentro del try: si initDb() rechaza hay que contestar igual, porque si no
    // el cliente se queda esperando una respuesta que nunca llega.
    await ready;

    // selectArrays y no selectObjects para drizzle: mapea las columnas por
    // posicion, con objetos leeria row[0], row[1]... y devolveria undefined
    // en cada campo. Tambien sirve para DDL (CREATE TABLE): internamente usa
    // exec() y simplemente no produce filas. rowMode 'object' (solo lo pide
    // la consola de debug) usa selectObjects para tener nombres de columna.
    let payload: QueryRows;
    if (rowMode === 'object') {
      // Nadie pide 'get' en modo objeto (solo lo usa la consola, con 'all').
      if (method === 'get') throw new Error("method 'get' no soporta rowMode 'object'.");
      payload = db.selectObjects(sql, params);
    } else {
      const rows = db.selectArrays(sql, params);
      payload = method === 'get' ? (rows[0] ?? []) : rows;
    }

    postMessage({ id, rows: payload } satisfies QuerySuccessResponse);
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : String(e);
    postMessage({ id, error } satisfies QueryErrorResponse);
  }
});
