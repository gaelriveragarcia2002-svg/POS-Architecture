// * Interfaces del modelo de filtros.
export interface PaginationState {
    first: number;
    rows: number;
    page: number;
}

export interface MutableCatalogState {
    sortBy: unknown;
    categoria: number | null;
    taller: number | null;
    // string (no string | null): los inputs de texto nativos de Signal Forms
    // no aceptan null, el vacio se representa con ''.
    marca: string;
    rating: number | null;
    disponibilidad: number | null;
}

// Forma combinada usada solo para el payload final de la request.
export type CatalogState = PaginationState & MutableCatalogState;
export type FILTRABLE_CATALOG_OPTIONS = keyof MutableCatalogState;
export type FilterRegistrationId = symbol;

// * Constantes del modelo de filtros.
export const INITIAL_PAGINATION: PaginationState = {
    first: 0,
    rows: 20,
    page: 0,
};

export const FILTRABLE_STATE: MutableCatalogState = {
    sortBy: null,
    categoria: null,
    taller: null,
    marca: '',
    rating: null,
    disponibilidad: null,
};

export const ALL_FILTRABLE_KEYS = Object.keys(FILTRABLE_STATE) as FILTRABLE_CATALOG_OPTIONS[];
