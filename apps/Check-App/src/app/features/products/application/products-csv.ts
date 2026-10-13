import { Product } from '@pos-architecture/products';

export interface CsvColumn<T> {
    header: string;
    value: (row: T) => string | number;
}

// Comillas dobles escapadas segun RFC 4180.
const escape = (cell: string | number): string => `"${String(cell).replace(/"/g, '""')}"`;

/** Construye un CSV (con BOM para que Excel respete UTF-8). */
export const toCsv = <T>(columns: CsvColumn<T>[], rows: T[]): string => {
    const header = columns.map((c) => escape(c.header)).join(',');
    const lines = rows.map((row) => columns.map((c) => escape(c.value(row))).join(','));
    return '﻿' + [header, ...lines].join('\n');
};

const PRODUCT_COLUMNS: CsvColumn<Product>[] = [
    { header: 'Id', value: (p) => p.id },
    { header: 'Nombre', value: (p) => p.name },
    { header: 'Categoria', value: (p) => p.category },
    { header: 'Precio', value: (p) => p.price },
    { header: 'Stock', value: (p) => p.stock },
];

/** Reporte A: listado completo de productos. */
export const buildProductsCsv = (products: Product[]): string => toCsv(PRODUCT_COLUMNS, products);

/** Reporte B: productos bajo el umbral, con cuantas unidades faltan para alcanzarlo. */
export const buildLowStockCsv = (products: Product[], threshold: number): string =>
    toCsv<Product>(
        [
            { header: 'Nombre', value: (p) => p.name },
            { header: 'Categoria', value: (p) => p.category },
            { header: 'Stock', value: (p) => p.stock },
            { header: 'Faltante', value: (p) => threshold - p.stock },
        ],
        [...products].sort((a, b) => a.stock - b.stock),
    );
