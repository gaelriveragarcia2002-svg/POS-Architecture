export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

/** Filtros opcionales para consultar productos. */
export interface ProductsFilter {
  category?: string;
  /** Solo productos con stock por debajo de este minimo. */
  lowStockBelow?: number;
}
