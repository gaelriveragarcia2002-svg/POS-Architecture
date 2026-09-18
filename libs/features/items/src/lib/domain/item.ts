export interface Item {
  id: string;
  name: string;
  quantity: number;
  createdAt: string;
}

/** Datos necesarios para crear un item nuevo; el resto lo decide el dominio. */
export interface NewItem {
  name: string;
  quantity: number;
}
