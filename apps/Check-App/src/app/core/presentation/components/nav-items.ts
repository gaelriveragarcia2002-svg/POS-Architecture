// * Opciones de navegación compartidas por el sidebar (desktop) y la barra inferior (mobile).
export interface NavItem {
    label: string;
    short: string;
    // Sin `path` la opción se muestra deshabilitada hasta que exista su ruta.
    path?: string;
}

// * Destinos principales: arriba en el sidebar, pestañas en la barra inferior.
export const PRIMARY_NAV: NavItem[] = [
    { label: 'Inspecciones', short: 'IN', path: '/' },
    { label: 'Items', short: 'IT', path: '/items' },
    { label: 'Ejemplo 1', short: 'E1', path: '/example-1' },
    { label: 'Ejemplo 2', short: 'E2', path: '/example-2' },
];

// * Destinos secundarios: al fondo del sidebar, hoja "Más" en la barra inferior.
export const SECONDARY_NAV: NavItem[] = [
    { label: 'Consola DB', short: 'DB', path: '/db' },
    { label: 'Configuración', short: 'CF' },
    { label: 'Cerrar sesión', short: 'CS' },
];
