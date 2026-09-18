/// <reference lib="webworker" />
import sqlite3InitModule, { type OpfsDatabase } from '@sqlite.org/sqlite-wasm';
import type {
  QueryErrorResponse,
  QueryRequest,
  QueryRows,
  QuerySuccessResponse,
} from './worker-protocol';

let db: OpfsDatabase;

// * Funcion de inicializacion de DB.
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

  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      quantity INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);
}

// Se lanza una sola vez; cada query espera a que termine.
const ready = initDb();

// * Listener de evento
addEventListener('message', async (event: MessageEvent<QueryRequest>) => {
  const { id, sql, params, method } = event.data;

  try {
    // Dentro del try: si initDb() rechaza hay que contestar igual, porque si no
    // el cliente se queda esperando una respuesta que nunca llega.
    await ready;

    // selectArrays y no selectObjects: drizzle mapea las columnas por posicion,
    // con objetos leeria row[0], row[1]... y devolveria undefined en cada campo.
    const rows = db.selectArrays(sql, params);

    const payload: QueryRows = method === 'get' ? (rows[0] ?? []) : rows;
    postMessage({ id, rows: payload } satisfies QuerySuccessResponse);
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : String(e);
    postMessage({ id, error } satisfies QueryErrorResponse);
  }
});
